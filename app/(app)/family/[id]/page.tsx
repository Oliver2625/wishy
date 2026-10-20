import { EyeOffIcon, GiftIcon } from 'lucide-react'
import type { Metadata } from 'next'
import { notFound, redirect } from 'next/navigation'
import { toggleReserve } from '@/app/(app)/actions'
import { ActionButton } from '@/components/action-button'
import { Avatar, GiftCard, type GiftState } from '@/components/wish-card'
import { getMember } from '@/lib/auth'
import { sql } from '@/lib/db'
import { getList, getWishes } from '@/lib/lists'
import { daysToGo, type Occasion, OCCASIONS } from '@/lib/occasions'

export async function generateMetadata({ params }: PageProps<'/family/[id]'>): Promise<Metadata> {
  const me = await getMember()
  const list = me && await getList((await params).id, me)
  return { title: list ? list.title : undefined }
}

// Someone else's list, as family sees it.
export default async function FamilyListPage({ params }: PageProps<'/family/[id]'>) {
  const me = await getMember()
  if (!me) return null
  const { id } = await params
  const list = await getList(id, me)
  if (!list) notFound()
  if (list.role === 'owner') redirect(`/lists/${id}`)

  const [wishes, [profile]] = await Promise.all([
    getWishes(list, me),
    sql`select to_char(birthday, 'FMDD FMMonth') as birthday, clothing_size, shoe_size, likes, avoid
        from profiles where user_id = ${list.owner_id}`,
  ])
  const goodToKnow = profile && ([
    ['Birthday', profile.birthday], ['Clothing size', profile.clothing_size], ['Shoe size', profile.shoe_size],
    ['Likes', profile.likes], ['Please avoid', profile.avoid],
  ] as const).filter(([, v]) => v)
  const reserved = wishes.filter((w) => w.reserved).length
  const firstName = list.owner_name.split(' ')[0]
  const canReserve = list.role === 'reserve'
  const state = (w: (typeof wishes)[number]): GiftState => w.reserved_by_me ? 'mine' : w.reserved ? 'taken' : 'free'
  // Free gifts first, since choosing one is the job here; taken ones go last and quiet.
  const sections = ([
    { state: 'free', title: 'Still free' },
    { state: 'mine', title: 'Reserved by you' },
    { state: 'taken', title: 'Already taken' },
  ] as const).map((s) => ({ ...s, wishes: wishes.filter((w) => state(w) === s.state) }))
  let i = 0 // running index, so the entrance stagger flows across sections

  return (
    // Same width as every page, so the left edge lines up with the header.
    <main className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-8 sm:py-12">
      <header className="flex items-center gap-4 sm:gap-5">
        <Avatar name={list.owner_name} className="size-16 ring-4 ring-card sm:size-20" />
        <div className="min-w-0">
          <p className="text-sm font-medium text-muted-foreground sm:text-base">
            {[`${firstName}’s list`, OCCASIONS[list.occasion as Occasion], daysToGo(list.event_date)].filter(Boolean).join(' · ')}
          </p>
          <h1 className="mt-1 text-4xl font-bold tracking-tight wrap-break-word sm:text-5xl">{list.title}</h1>
        </div>
      </header>

      <div className="mt-8 grid items-start gap-8 lg:grid-cols-[minmax(0,1fr)_20rem] lg:gap-10">
        {/* Phones: this panel comes first, so the progress and the sizes are read before choosing. */}
        <aside className="space-y-4 lg:sticky lg:top-6 lg:order-last">
          <section className="rounded-2xl border bg-card p-5">
            <h2 className="flex items-baseline justify-between gap-2 font-semibold">
              {reserved} of {wishes.length} reserved
              <span className="text-sm font-normal text-muted-foreground">{wishes.length - reserved} still free</span>
            </h2>
            {/* One segment per wish: a tally of how far the family has got. The text above carries the meaning. */}
            <div aria-hidden className="mt-3 flex h-2 gap-1">
              {sections.flatMap((s) => s.wishes.map((w) => (
                <span key={w.id} className={`min-w-0 flex-1 rounded-full ${s.state === 'free' ? 'bg-muted' : s.state === 'mine' ? 'bg-primary' : 'bg-chart-3'}`} />
              )))}
            </div>
            <p className="mt-4 flex gap-2 text-sm text-muted-foreground">
              <EyeOffIcon className="mt-0.5 size-4 shrink-0" />
              {canReserve
                ? `${firstName} can’t see what’s reserved, so the surprise holds.`
                : `${firstName} shared this list for you to look at. Ask ${firstName} if you want to reserve gifts from it.`}
            </p>
          </section>

          {list.message && (
            <blockquote className="rounded-2xl border bg-card p-5">
              <p>&ldquo;{list.message}&rdquo;</p>
              <footer className="mt-2 text-sm text-muted-foreground">— {firstName}</footer>
            </blockquote>
          )}

          {goodToKnow && goodToKnow.length > 0 && (
            <section className="rounded-2xl border bg-card p-5">
              <h2 className="font-semibold">Good to know</h2>
              <dl className="mt-3 grid grid-cols-[auto_1fr] gap-x-4 gap-y-2 text-sm">
                {goodToKnow.map(([label, value]) => (
                  <div key={label} className="contents">
                    <dt className="text-muted-foreground">{label}</dt>
                    <dd className="whitespace-pre-line">{value}</dd>
                  </div>
                ))}
              </dl>
            </section>
          )}
        </aside>

        <div className="min-w-0 space-y-10">
          {!wishes.length && (
            <p className="rounded-2xl border border-dashed p-8 text-center text-muted-foreground">No wishes on this list yet.</p>
          )}
          {sections.map((s) => (s.wishes.length > 0 || (s.state === 'free' && wishes.length > 0)) && (
            <section key={s.state} aria-labelledby={`section-${s.state}`}>
              <h2 id={`section-${s.state}`} className="mb-4 flex items-center gap-2 text-xl font-bold tracking-tight">
                {s.title}
                <span className="rounded-full bg-secondary px-2.5 py-0.5 text-sm font-semibold text-secondary-foreground">{s.wishes.length}</span>
              </h2>
              {s.wishes.length ? (
                <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
                  {s.wishes.map((w) => (
                    <GiftCard key={w.id} index={i++} wish={w} state={s.state} reserver={w.reserver_name}>
                      {s.state === 'free' && canReserve && (
                        <ActionButton action={toggleReserve.bind(null, w.id)} variant="outline" className="h-11 px-5 text-base"><GiftIcon /> Reserve</ActionButton>
                      )}
                      {s.state === 'mine' && (
                        <ActionButton action={toggleReserve.bind(null, w.id)} variant="outline" className="h-11 px-5 text-base">Unreserve</ActionButton>
                      )}
                    </GiftCard>
                  ))}
                </div>
              ) : (
                <p className="rounded-2xl border border-dashed p-8 text-center text-muted-foreground">Every gift is taken. Nice work, family.</p>
              )}
            </section>
          ))}
        </div>
      </div>
    </main>
  )
}
