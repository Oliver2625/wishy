import { ChevronRightIcon } from 'lucide-react'
import type { Metadata } from 'next'
import Link from 'next/link'
import { toggleReserve } from '@/app/(app)/actions'
import { ActionButton } from '@/components/action-button'
import { Avatar, type CardWish, WishCard } from '@/components/wish-card'
import { getMember } from '@/lib/auth'
import { sql } from '@/lib/db'

export const metadata: Metadata = { title: 'Reserved by me' }

export default async function ReservedPage() {
  const me = await getMember()
  if (!me) return null

  const wishes = (await sql`
    select w.id, w.title, w.store, w.url, w.price, w.currency, w.priority, w.note, w.image_url,
           l.id as list_id, l.title as list_title, l.owner_id, coalesce(nullif(u.name, ''), split_part(u.email, '@', 1)) as owner_name
    from wishes w join wishlists l on l.id = w.wishlist_id join neon_auth."user" u on u.id = l.owner_id
    where w.reserved_by = ${me.id} order by owner_name, l.title, w.created_at`) as (CardWish & { id: string; list_id: string; list_title: string; owner_id: string; owner_name: string })[]
  // Who each gift is for, then which of their lists it came from. Same grouping as the Family page.
  const people = [...Map.groupBy(wishes, (w) => w.owner_id).values()].map((theirs) => [...Map.groupBy(theirs, (w) => w.list_id).values()])
  let i = 0 // running index, so the entrance stagger flows across sections

  return (
    <main className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-8 sm:py-12">
      <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">Reserved by me</h1>
      <p className="mt-2 text-muted-foreground">Gifts you&apos;ve promised to buy. Only you can see this.</p>
      {wishes.length ? (
        <div className="mt-8 space-y-12">
          {people.map((lists) => {
            const { owner_id, owner_name } = lists[0][0]
            const count = lists.reduce((n, l) => n + l.length, 0)
            return (
              <section key={owner_id} aria-labelledby={`for-${owner_id}`}>
                <h2 id={`for-${owner_id}`} className="flex items-center gap-3 text-2xl font-bold tracking-tight">
                  <Avatar name={owner_name} className="size-11" />
                  For {owner_name}
                  <span className="rounded-full bg-secondary px-2.5 py-0.5 text-sm font-semibold text-secondary-foreground">{count}</span>
                </h2>
                <div className="mt-5 space-y-8 border-l-2 border-border pl-5 sm:ml-5 sm:pl-8">
                  {lists.map((gifts) => (
                    <div key={gifts[0].list_id}>
                      <h3>
                        <Link href={`/family/${gifts[0].list_id}`} className="group inline-flex items-center gap-1 font-semibold text-primary hover:underline">
                          {gifts[0].list_title}
                          <ChevronRightIcon className="size-4 transition-transform motion-safe:group-hover:translate-x-0.5" />
                        </Link>
                      </h3>
                      <div className="mt-3 grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                        {gifts.map((w) => (
                          <WishCard key={w.id} index={i++} wish={w}>
                            <ActionButton action={toggleReserve.bind(null, w.id)} variant="outline" className="h-11 px-5 text-base">Unreserve</ActionButton>
                          </WishCard>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )
          })}
        </div>
      ) : (
        <p className="mt-6 rounded-2xl border border-dashed p-8 text-center text-muted-foreground">
          Nothing reserved yet. Open a list under <Link href="/family" className="font-medium text-primary underline">Family</Link> and reserve a gift.
        </p>
      )}
    </main>
  )
}
