import { EyeIcon, EyeOffIcon, LockIcon, PencilIcon, PlusIcon, Share2Icon } from 'lucide-react'
import type { Metadata } from 'next'
import Link from 'next/link'
import { ViewTransition } from '@/lib/view-transition'
import { notFound, redirect } from 'next/navigation'
import { buttonVariants } from '@/components/ui/button'
import { WishCard } from '@/components/wish-card'
import { Page } from '@/components/wishlist'
import { getMember } from '@/lib/auth'
import { sql } from '@/lib/db'
import { BUDGET, formatPrice, isCurrency, toCurrency } from '@/lib/currency'
import { getList, getWishes } from '@/lib/lists'
import { daysToGo, type Occasion, OCCASIONS } from '@/lib/occasions'

export async function generateMetadata({ params }: PageProps<'/lists/[id]'>): Promise<Metadata> {
  const me = await getMember()
  const list = me && await getList((await params).id, me)
  return { title: list ? list.title : undefined }
}

export default async function MyListPage({ params, searchParams }: PageProps<'/lists/[id]'>) {
  const me = await getMember()
  if (!me) return null
  const { id } = await params
  const { f } = await searchParams
  const list = await getList(id, me)
  if (!list) notFound()
  if (list.role !== 'owner') redirect(`/family/${id}`)

  const [wishes, [{ people }], [profile]] = await Promise.all([
    getWishes(list, me),
    sql`select count(*)::int as people from list_shares where list_id = ${id}`,
    sql`select currency from profiles where user_id = ${me.id}`,
  ])
  // The budget filter speaks the owner's currency, and converts wishes saved in another one before comparing.
  const currency = isCurrency(profile?.currency) ? profile.currency : 'DKK'
  const budget = BUDGET[currency]
  const filters = [
    { key: undefined, label: 'All' },
    { key: 'wanted', label: 'Most wanted' },
    { key: 'cheap', label: `Under ${formatPrice(budget, currency)}` },
  ]
  const filter = filters.find((x) => x.key === f) ?? filters[0]
  // ponytail: one rate fetch per foreign-currency wish; fine for family-sized lists, cache rates if lists grow.
  const prices = filter.key === 'cheap'
    ? await Promise.all(wishes.map((w) => w.price === null ? null : toCurrency(Number(w.price), w.currency, currency)))
    : []
  const shown = filter.key === 'wanted' ? wishes.filter((w) => w.priority === 3)
    : filter.key === 'cheap' ? wishes.filter((_, i) => prices[i] !== null && prices[i] < budget) // unconvertible: left out
    : wishes
  const big = 'h-11 px-5 text-base'

  return (
    <Page me={me} activeId={list.id}>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div className="min-w-0">
          <span className="rounded-full bg-brand px-3 py-1 text-sm font-semibold text-brand-foreground">{OCCASIONS[list.occasion as Occasion]}</span>
          <h1 className="mt-3 text-4xl font-bold tracking-tight wrap-break-word sm:text-5xl">{list.title}</h1>
          <p className="mt-2 text-muted-foreground">
            {[
              `${wishes.length} ${wishes.length === 1 ? 'wish' : 'wishes'}`,
              people ? `shared with ${people} ${people === 1 ? 'person' : 'people'}` : 'only you',
              daysToGo(list.event_date),
            ].filter(Boolean).join(' · ')}
          </p>
        </div>
        <div className="flex w-full flex-wrap gap-3 *:flex-1 sm:w-auto sm:*:flex-none">
          <Link href={`/lists/${id}/edit`} className={buttonVariants({ variant: 'outline', className: big })}>
            <PencilIcon /> Edit list
          </Link>
          <Link href={`/lists/${id}/share`} className={buttonVariants({ variant: 'outline', className: big })}>
            <Share2Icon /> Share
          </Link>
          <Link href={`/wishes/new?list=${id}`} className={buttonVariants({ className: big })}>
            <PlusIcon /> Add a wish
          </Link>
        </div>
      </div>

      {list.message && <p className="mt-6 rounded-2xl border bg-card p-5">&ldquo;{list.message}&rdquo;</p>}

      <nav className="mt-6 flex flex-wrap gap-2" aria-label="Filter wishes">
        {filters.map((x) => (
          <Link
            key={x.label}
            href={x.key ? `?f=${x.key}` : '?'}
            aria-current={x === filter ? 'page' : undefined}
            className="rounded-lg border bg-card px-4 py-2.5 font-medium sm:px-5 transition-colors hover:bg-accent aria-[current=page]:border-primary aria-[current=page]:bg-primary aria-[current=page]:text-primary-foreground"
          >
            {x.label}
          </Link>
        ))}
      </nav>

      <ViewTransition key={filter.label} name="wish-grid" share="auto" enter="auto" default="none">
        {shown.length ? (
          <div className="mt-6 grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
            {shown.map((w, i) => (
              <WishCard key={w.id} index={i} wish={w} extra={w.reserved && (
                <p className="mt-1 flex items-center gap-1.5 text-sm font-medium"><LockIcon className="size-3.5" /> Reserved{w.reserver_name && ` by ${w.reserver_name}`}</p>
              )}>
                <Link href={`/wishes/${w.id}/edit`} className={buttonVariants({ variant: 'secondary', className: 'h-11 px-5 text-base' })}>Edit</Link>
              </WishCard>
            ))}
          </div>
        ) : (
          <p className="mt-6 rounded-2xl border border-dashed p-8 text-center text-muted-foreground">
            {wishes.length ? 'No wishes match this filter.' : <>No wishes yet. <Link href={`/wishes/new?list=${id}`} className="font-medium text-primary underline">Add your first one</Link>.</>}
          </p>
        )}
      </ViewTransition>

      <p className="mt-8 flex gap-3 rounded-2xl bg-brand/50 p-5 dark:bg-brand/15">
        {list.hide_reservations ? <EyeOffIcon className="mt-0.5 size-5 shrink-0" /> : <EyeIcon className="mt-0.5 size-5 shrink-0" />}
        {list.hide_reservations
          ? 'Reservations stay hidden from you, so your gifts remain a surprise. Your family can see which wishes are already taken.'
          : <span>You can see reservations on this list. <Link href={`/lists/${id}/share`} className="font-medium underline">Hide them in Share settings</Link>.</span>}
      </p>
    </Page>
  )
}
