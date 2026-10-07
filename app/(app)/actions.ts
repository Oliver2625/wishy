'use server'

import { refresh } from 'next/cache'
import { auth, getMember, isAdmin, isInvited } from '@/lib/auth'
import { formatPrice, isCurrency, toCurrency } from '@/lib/currency'
import { sql } from '@/lib/db'
import { fetchPublicPage } from '@/lib/fetch-page'
import { OCCASIONS } from '@/lib/occasions'
import { parsePrice, parseProduct } from '@/lib/parse'

// message: shown as a toast. redirectTo: where the client navigates after (so the toast survives the redirect).
export type Result = { error?: string; message?: string; redirectTo?: string } | null

const text = (f: FormData, k: string, max: number) => String(f.get(k) ?? '').trim().slice(0, max)
const isHttp = (u: string) => /^https?:\/\//i.test(u)

async function member() {
  const m = await getMember()
  if (!m) throw new Error('Not signed in')
  return m
}

// Create (no id) or edit (id) one of my lists. "family" visibility shares a new list with every invited member.
export async function saveList(_: Result, form: FormData): Promise<Result> {
  const me = await member()
  const id = text(form, 'id', 36)
  const title = text(form, 'title', 100)
  const occasion = text(form, 'occasion', 20)
  const date = text(form, 'date', 10) || null
  const message = text(form, 'message', 500) || null

  if (!title) return { error: 'Give the list a name.' }
  if (!Object.hasOwn(OCCASIONS, occasion)) return { error: 'Pick an occasion.' }
  if (date && !/^\d{4}-\d{2}-\d{2}$/.test(date)) return { error: 'That date doesn’t look right.' }

  if (id) {
    const rows = await sql`
      update wishlists set title = ${title}, occasion = ${occasion}, event_date = ${date}, message = ${message}
      where id = ${id} and owner_id = ${me.id} returning id`
    if (!rows.length) return { error: 'You can only change your own lists.' }
    return { message: 'List saved', redirectTo: `/lists/${id}` }
  }

  const newId = crypto.randomUUID()
  await sql.transaction([
    sql`insert into wishlists (id, owner_id, title, occasion, event_date, message)
        values (${newId}, ${me.id}, ${title}, ${occasion}, ${date}, ${message})`,
    ...(form.get('visibility') === 'family'
      ? [sql`insert into list_shares (list_id, email) select ${newId}, email from invites where email <> ${me.email.toLowerCase()}`]
      : []),
  ])
  return { message: `“${title}” created`, redirectTo: `/lists/${newId}` }
}

// Add (no id) or edit (id) a wish; the target list must be mine.
export async function saveWish(_: Result, form: FormData): Promise<Result> {
  const me = await member()
  const id = text(form, 'id', 36)
  const listId = text(form, 'listId', 36)
  const title = text(form, 'title', 200)
  const store = text(form, 'store', 100) || null
  const url = text(form, 'url', 2000) || null
  const imageUrl = text(form, 'imageUrl', 2000) || null
  const note = text(form, 'note', 500) || null
  const price = parsePrice(text(form, 'price', 30))
  const priority = Number(form.get('priority')) || 2
  const currency = text(form, 'currency', 3)

  if (!title) return { error: 'Tell your family what you wish for.' }
  if (!isCurrency(currency)) return { error: 'Unknown currency.' }
  if (Number.isNaN(price)) return { error: 'Price should be a number, like 649.' }
  if ((url && !isHttp(url)) || (imageUrl && !isHttp(imageUrl))) return { error: 'Links must start with http:// or https://' }
  if (![1, 2, 3].includes(priority)) return { error: 'Pick how much you want it.' }

  const rows = id
    ? await sql`
        update wishes set wishlist_id = ${listId}, title = ${title}, store = ${store}, url = ${url}, image_url = ${imageUrl},
               note = ${note}, price = ${price}, currency = ${currency}, priority = ${priority}
        where id = ${id}
          and wishlist_id in (select id from wishlists where owner_id = ${me.id})
          and exists (select 1 from wishlists where id = ${listId} and owner_id = ${me.id})
        returning id`
    : await sql`
        insert into wishes (wishlist_id, title, store, url, image_url, note, price, currency, priority)
        select id, ${title}, ${store}, ${url}, ${imageUrl}, ${note}, ${price}, ${currency}, ${priority}
        from wishlists where id = ${listId} and owner_id = ${me.id}
        returning id`
  if (!rows.length) return { error: 'You can only save wishes to your own lists.' }
  return { message: id ? 'Wish saved' : `“${title}” added`, redirectTo: `/lists/${listId}` }
}

export async function deleteWish(id: string): Promise<Result> {
  const me = await member()
  const [row] = await sql`
    delete from wishes where id = ${id} and wishlist_id in (select id from wishlists where owner_id = ${me.id})
    returning wishlist_id`
  return row ? { message: 'Wish deleted', redirectTo: `/lists/${row.wishlist_id}` } : { error: 'Couldn’t delete that wish.' }
}

// Reserve a free wish on a list I can reserve from, or release my own reservation.
export async function toggleReserve(id: string): Promise<Result> {
  const me = await member()
  const [row] = await sql`
    update wishes set reserved_by = case when reserved_by is null then ${me.id}::uuid end
    where id = ${id} and (
      reserved_by = ${me.id}
      or (reserved_by is null and wishlist_id in (
        select list_id from list_shares where email = ${me.email.toLowerCase()} and role = 'reserve')))
    returning title, reserved_by`
  refresh()
  if (!row) return { error: 'Someone else just reserved that one.' }
  return { message: row.reserved_by ? `You reserved “${row.title}”` : `Reservation for “${row.title}” removed` }
}

// "Fetch details": read name, price, store and photo from a shop page.
// A price in another currency is converted to `currency` (the one the form saves in).
export async function fetchDetails(url: string, currency: string) {
  await member()
  if (!isCurrency(currency)) return { error: 'Unknown currency.' }
  try {
    const page = await fetchPublicPage(url)
    const { currency: from, ...p } = parseProduct(page.html, page.url)
    const amount = parsePrice(p.price)
    if (!from || from === currency || !amount) return { ...p, priceNote: '' }
    const converted = await toCurrency(amount, from, currency)
    const original = `${amount} ${from}`
    return converted === null
      ? { ...p, price: '', priceNote: `The shop’s price is ${original}. Couldn’t convert it, so type it in.` }
      : { ...p, price: String(converted), priceNote: `Price converted from ${original} to ${formatPrice(converted, currency)}.` }
  } catch (e) {
    // Only our own guard messages are shown; network/DNS errors get a generic one.
    const own = e instanceof Error && e.name === 'Error' && !('code' in e)
    return { error: own ? e.message : 'Couldn’t reach that page. Type the details in below.' }
  }
}

// Share one of my lists by email. The admin's shares also let that email into Wishy (adds it to invites).
export async function shareList(listId: string, _: Result, form: FormData): Promise<Result> {
  const me = await member()
  const email = text(form, 'email', 200).toLowerCase()
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return { error: 'Enter a valid email.' }
  if (email === me.email.toLowerCase()) return { error: 'That’s you.' }
  const [list] = await sql`select id from wishlists where id = ${listId} and owner_id = ${me.id}`
  if (!list) return { error: 'You can only share your own lists.' }
  // Members share with people already in Wishy; only the admin can let someone new in.
  const admin = isAdmin(me.email)
  if (!admin && !(await isInvited(email))) return { error: 'They aren’t on Wishy yet. Ask the admin to invite them first.' }
  await sql.transaction([
    ...(admin ? [sql`insert into invites (email) values (${email}) on conflict do nothing`] : []),
    sql`insert into list_shares (list_id, email) values (${listId}, ${email}) on conflict do nothing`,
  ])
  refresh()
  return { message: `Added ${email}. They can sign in with this email to see the list.` }
}

export async function setShareRole(listId: string, email: string, form: FormData): Promise<Result> {
  const me = await member()
  const role = form.get('role')
  if (role === 'remove') {
    // New share code too, or the removed person could rejoin through the old link (/l/[code]).
    await sql.transaction([
      sql`delete from list_shares where list_id = ${listId} and email = ${email}
          and list_id in (select id from wishlists where owner_id = ${me.id})`,
      sql`update wishlists set share_code = replace(gen_random_uuid()::text, '-', '')
          where id = ${listId} and owner_id = ${me.id}`,
    ])
    refresh()
    return { message: `Removed ${email}` }
  }
  if (role === 'reserve' || role === 'view') {
    await sql`update list_shares set role = ${role} where list_id = ${listId} and email = ${email}
              and list_id in (select id from wishlists where owner_id = ${me.id})`
  }
  refresh()
  return { message: role === 'view' ? `${email} can now only view` : `${email} can now reserve` }
}

export async function updateSurprise(listId: string, form: FormData): Promise<Result> {
  const me = await member()
  await sql`update wishlists set hide_reservations = ${form.get('hide') === 'on'}, show_reserver = ${form.get('showReserver') === 'on'}
            where id = ${listId} and owner_id = ${me.id}`
  refresh()
  return { message: 'Surprise settings saved' }
}

// Name lives in Neon Auth, the rest in profiles. Email can't change here: it's the sign-in and invite key.
export async function saveProfile(_: Result, form: FormData): Promise<Result> {
  const me = await member()
  const name = text(form, 'name', 80)
  const birthday = text(form, 'birthday', 10) || null
  const clothing = text(form, 'clothing', 20) || null
  const shoe = text(form, 'shoe', 20) || null
  const likes = text(form, 'likes', 500) || null
  const avoid = text(form, 'avoid', 500) || null
  const currency = text(form, 'currency', 3)

  if (!name) return { error: 'Your name is required.' }
  if (!isCurrency(currency)) return { error: 'Pick a currency.' }
  if (birthday && !/^\d{4}-\d{2}-\d{2}$/.test(birthday)) return { error: 'That birthday doesn’t look right.' }

  const { error } = await auth.updateUser({ name })
  if (error) return { error: 'Couldn’t save your name. Try again.' }
  await sql`
    insert into profiles (user_id, birthday, clothing_size, shoe_size, likes, avoid, currency)
    values (${me.id}, ${birthday}, ${clothing}, ${shoe}, ${likes}, ${avoid}, ${currency})
    on conflict (user_id) do update set birthday = excluded.birthday, clothing_size = excluded.clothing_size,
      shoe_size = excluded.shoe_size, likes = excluded.likes, avoid = excluded.avoid, currency = excluded.currency`
  refresh()
  return { message: 'Profile saved' }
}

// Admin only: let a new email into Wishy without sharing a list yet.
export async function inviteToWishy(_: Result, form: FormData): Promise<Result> {
  const me = await member()
  if (!isAdmin(me.email)) return { error: 'Only the admin can invite people to Wishy.' }
  const email = text(form, 'email', 200).toLowerCase()
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return { error: 'Enter a valid email.' }
  const rows = await sql`insert into invites (email) values (${email}) on conflict do nothing returning email`
  refresh()
  return rows.length ? { message: `${email} can now sign in to Wishy` } : { error: `${email} is already invited.` }
}

// Leaves Wishy for good: lists and wishes cascade, reservations are released, and the invite goes too.
export async function deleteAccount(): Promise<Result> {
  const me = await member()
  if (isAdmin(me.email)) return { error: 'The admin account can’t be deleted here.' }
  await auth.signOut()
  await sql.transaction([
    sql`delete from invites where email = ${me.email.toLowerCase()}`,
    sql`delete from neon_auth."user" where id = ${me.id}`,
  ])
  return { message: 'Your account was deleted', redirectTo: '/login' }
}
