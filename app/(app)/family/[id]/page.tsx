import { CheckIcon, EyeOffIcon, GiftIcon, LockIcon } from 'lucide-react'
import { notFound, redirect } from 'next/navigation'
import { toggleReserve } from '@/app/(app)/actions'
import { ActionButton } from '@/components/action-button'
import { Avatar, WishRow } from '@/components/wish-card'
import { getMember } from '@/lib/auth'
import { sql } from '@/lib/db'
import { getList, getWishes } from '@/lib/lists'
import { daysToGo, type Occasion, OCCASIONS } from '@/lib/occasions'

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

  return (
    <main className="mx-auto w-full max-w-5xl px-4 py-8 sm:px-8 sm:py-12">
      <div className="flex items-center gap-5">
        <Avatar name={list.owner_name} className="size-16 sm:size-20" />
        <div className="min-w-0">
          <span className="rounded-full bg-brand px-3 py-1 text-sm font-semibold text-brand-foreground">{OCCASIONS[list.occasion as Occasion]}</span>
          <h1 className="mt-3 text-3xl font-bold tracking-tight wrap-break-word sm:text-5xl">{list.title}</h1>
          <p className="mt-2 text-muted-foreground">
            {[
              `${wishes.length} ${wishes.length === 1 ? 'wish' : 'wishes'}`, `${reserved} reserved`,
              `${wishes.length - reserved} still free`, daysToGo(list.event_date),
            ].filter(Boolean).join(' · ')}
          </p>
        </div>
      </div>

      {list.message && (
        <p className="mt-6 rounded-2xl border bg-card p-5">
          &ldquo;{list.message}&rdquo; <span className="text-muted-foreground">— {firstName}</span>
        </p>
      )}

      {goodToKnow && goodToKnow.length > 0 && (
        <section className="mt-6 rounded-2xl border bg-card p-5">
          <h2 className="font-semibold">Good to know about {firstName}</h2>
          <dl className="mt-3 grid gap-x-6 gap-y-2 sm:grid-cols-[auto_1fr]">
            {goodToKnow.map(([label, value]) => (
              <div key={label} className="contents">
                <dt className="text-muted-foreground">{label}</dt>
                <dd className="whitespace-pre-line">{value}</dd>
              </div>
            ))}
          </dl>
        </section>
      )}

      <p className="mt-8 flex gap-3 rounded-2xl bg-brand/50 p-5 dark:bg-brand/15">
        <EyeOffIcon className="mt-0.5 size-5 shrink-0" />
        {list.role === 'reserve'
          ? `${firstName} can't see what is reserved. Reserve a gift so nobody else in the family buys the same one.`
          : `${firstName} shared this list with you to look at. Ask ${firstName} if you want to reserve gifts from it.`}
      </p>

      <div className="mt-6 space-y-4">
        {wishes.map((w, i) => (
          <WishRow key={w.id} index={i} wish={w}>
            {w.reserved_by_me ? (
              <div className="flex items-center gap-4">
                <span className="inline-flex h-11 flex-1 items-center justify-center gap-2 rounded-lg bg-foreground px-5 sm:flex-none font-semibold text-background">
                  <CheckIcon className="size-4" /> Reserved by you
                </span>
                <ActionButton action={toggleReserve.bind(null, w.id)} variant="link" className="px-0 text-base font-semibold underline">Undo</ActionButton>
              </div>
            ) : w.reserved ? (
              <span className="inline-flex h-11 items-center justify-center gap-2 rounded-lg border border-dashed border-ring px-5 text-muted-foreground">
                <LockIcon className="size-4" /> Reserved{w.reserver_name && ` by ${w.reserver_name}`}
              </span>
            ) : list.role === 'reserve' ? (
              <ActionButton action={toggleReserve.bind(null, w.id)} className="h-11 px-5 text-base"><GiftIcon /> Reserve this gift</ActionButton>
            ) : null}
          </WishRow>
        ))}
        {!wishes.length && (
          <p className="rounded-2xl border border-dashed p-8 text-center text-muted-foreground">No wishes on this list yet.</p>
        )}
      </div>
    </main>
  )
}
