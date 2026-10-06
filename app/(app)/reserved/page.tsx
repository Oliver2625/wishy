import Link from 'next/link'
import { toggleReserve } from '@/app/(app)/actions'
import { ActionButton } from '@/components/action-button'
import { type CardWish, WishCard } from '@/components/wish-card'
import { getMember } from '@/lib/auth'
import { sql } from '@/lib/db'

export default async function ReservedPage() {
  const me = await getMember()
  if (!me) return null

  const wishes = (await sql`
    select w.id, w.title, w.store, w.url, w.price, w.priority, w.note, w.image_url,
           l.id as list_id, l.title as list_title, coalesce(nullif(u.name, ''), split_part(u.email, '@', 1)) as owner_name
    from wishes w join wishlists l on l.id = w.wishlist_id join neon_auth."user" u on u.id = l.owner_id
    where w.reserved_by = ${me.id} order by owner_name, w.created_at`) as (CardWish & { id: string; list_id: string; list_title: string; owner_name: string })[]

  return (
    <main className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-8 sm:py-12">
      <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">Reserved by me</h1>
      <p className="mt-2 text-muted-foreground">Gifts you&apos;ve promised to buy. Only you can see this.</p>
      {wishes.length ? (
        <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {wishes.map((w, i) => (
            <WishCard key={w.id} index={i} wish={w} extra={
              <Link href={`/family/${w.list_id}`} className="text-sm text-primary hover:underline">
                For {w.owner_name} · {w.list_title}
              </Link>
            }>
              <ActionButton action={toggleReserve.bind(null, w.id)} variant="outline" className="h-10 px-4">Unreserve</ActionButton>
            </WishCard>
          ))}
        </div>
      ) : (
        <p className="mt-6 rounded-2xl border border-dashed p-8 text-center text-muted-foreground">
          Nothing reserved yet. Open a family member&apos;s list and reserve a wish.
        </p>
      )}
    </main>
  )
}
