import 'server-only'
import { cache } from 'react'
import { sql } from './db'

export type Role = 'owner' | 'reserve' | 'view'
export type Member = { id: string; email: string }

export type Wish = {
  id: string; title: string; store: string | null; url: string | null; price: string | null; currency: string
  priority: number; note: string | null; image_url: string | null
  reserved: boolean; reserved_by_me: boolean; reserver_name: string | null
}

export const PRIORITIES = { 1: 'Nice to have', 2: 'Would love', 3: 'Most wanted' } as const

// The list plus my role on it, or null if I can't see it. cache(): generateMetadata and the page share one lookup.
export const getList = cache(async (id: string, me: Member) => {
  if (!/^[0-9a-f-]{36}$/i.test(id)) return null
  const [list] = await sql`
    select l.id, l.title, l.owner_id, l.share_code, l.hide_reservations, l.show_reserver,
           l.occasion, l.message, l.event_date::text as event_date, coalesce(nullif(u.name, ''), split_part(u.email, '@', 1)) as owner_name,
           case when l.owner_id = ${me.id} then 'owner' else s.role end as role
    from wishlists l
    join neon_auth."user" u on u.id = l.owner_id
    left join list_shares s on s.list_id = l.id and s.email = ${me.email.toLowerCase()}
    where l.id = ${id}`
  return list?.role ? (list as typeof list & { role: Role }) : null
})

// Reservation details are filtered here, server-side, per the list's surprise settings.
export async function getWishes(list: NonNullable<Awaited<ReturnType<typeof getList>>>, me: Member): Promise<Wish[]> {
  const rows = await sql`
    select w.id, w.title, w.store, w.url, w.price, w.currency, w.priority, w.note, w.image_url, w.reserved_by, coalesce(nullif(r.name, ''), split_part(r.email, '@', 1)) as reserver_name
    from wishes w left join neon_auth."user" r on r.id = w.reserved_by
    where w.wishlist_id = ${list.id} order by w.priority desc, w.created_at`
  const hidden = list.role === 'owner' && list.hide_reservations
  return rows.map(({ reserved_by, reserver_name, ...w }) => ({
    ...(w as Omit<Wish, 'reserved' | 'reserved_by_me' | 'reserver_name'>),
    reserved: !hidden && !!reserved_by,
    reserved_by_me: reserved_by === me.id,
    reserver_name: hidden || (list.role !== 'owner' && !list.show_reserver) ? null : reserver_name,
  }))
}

export const myLists = (me: Member) =>
  sql`select l.id, l.title, count(w.id)::int as count
      from wishlists l left join wishes w on w.wishlist_id = l.id
      where l.owner_id = ${me.id} group by l.id order by l.created_at`

export const sharedWithMe = (me: Member) =>
  sql`select l.id, l.title, l.owner_id, coalesce(nullif(u.name, ''), split_part(u.email, '@', 1)) as name, count(w.id)::int as count, count(w.reserved_by)::int as reserved
      from list_shares s
      join wishlists l on l.id = s.list_id
      join neon_auth."user" u on u.id = l.owner_id
      left join wishes w on w.wishlist_id = l.id
      where s.email = ${me.email.toLowerCase()}
      group by l.id, u.id order by 4, l.created_at`

// Everyone invited to Wishy except me: who "My family" means when creating a list.
export const family = (me: Member) =>
  sql`select i.email, coalesce(nullif(u.name, ''), split_part(i.email, '@', 1)) as name
      from invites i left join neon_auth."user" u on lower(u.email) = i.email
      where i.email <> ${me.email.toLowerCase()} order by 2`
