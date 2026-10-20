'use client'

import { useState } from 'react'
import { CheckIcon, EyeOffIcon, GiftIcon, ListIcon, LockIcon, PencilIcon, PlusIcon, Share2Icon, UsersIcon } from 'lucide-react'
import { Logo } from '@/components/logo'
import { buttonVariants } from '@/components/ui/button'
import { Avatar, type CardWish, WishCard, WishRow } from '@/components/wish-card'
import { cn } from '@/lib/utils'

// Sample wishes. url: null so the real cards render plain titles, not links, inside the decorative window.
const wish = (title: string, store: string, price: number, priority: number, image: string, note: string | null = null): CardWish =>
  ({ title, store, url: null, price: String(price), currency: 'DKK', priority, note, image_url: `/landing/${image}.svg` })
const wishes: (CardWish & { takenBy?: string })[] = [
  { ...wish('Striped rugby shirt', 'Example store', 540, 3, 'shirt', 'Size: Medium. Other colours are fine too.'), takenBy: 'Dad' },
  wish('Rain jacket, olive', 'Example outdoor shop', 1699, 3, 'jacket', 'Size: Medium'),
  { ...wish('Wireless headphones', 'Example electronics', 1299, 2, 'headphones'), takenBy: 'you' },
  wish('Navy tote bag', 'Example store', 349, 1, 'tote'),
]

const views = {
  owner: { label: 'Your view', caption: 'This is your list. Reservations stay hidden from you.' },
  family: { label: 'Your family’s view', caption: 'Family see what’s taken, so nobody buys the same gift.' },
}
type View = keyof typeof views

const big = 'h-11 px-5 text-base'

// The hero's interactive picture of the product: the same list seen by its owner and by family.
// Built from the app's own components, so it stays in step with the real pages.
// The window itself is decorative (aria-hidden, inert); the toggle and its caption carry the meaning.
export function LandingPreview({ countdown }: { countdown: string | null }) {
  const [view, setView] = useState<View>('owner')

  return (
    <div className="flex flex-col items-center gap-4">
      <div role="group" aria-label="Show the list as" className="relative grid grid-cols-2 rounded-full bg-card p-1 shadow-sm ring-1 ring-border">
        <span
          aria-hidden
          className={cn(
            'absolute inset-y-1 left-1 w-[calc(50%-0.25rem)] rounded-full bg-ink transition-transform duration-500 ease-[cubic-bezier(0.2,0.8,0.2,1)] motion-reduce:transition-none',
            view === 'family' && 'translate-x-full',
          )}
        />
        {(Object.keys(views) as View[]).map((v) => (
          <button
            key={v}
            type="button"
            aria-pressed={view === v}
            onClick={() => setView(v)}
            className="relative z-10 min-h-11 rounded-full px-4 text-sm font-semibold whitespace-nowrap text-muted-foreground transition-colors duration-300 outline-none focus-visible:ring-3 focus-visible:ring-ring/50 aria-pressed:text-ink-foreground sm:px-5"
          >
            {views[v].label}
          </button>
        ))}
      </div>
      <p aria-live="polite" className="text-sm text-muted-foreground">{views[view].caption}</p>

      <div aria-hidden inert className="mt-6 w-full select-none">
        <div className="overflow-hidden rounded-3xl bg-background text-left shadow-[0_30px_80px_-30px_rgb(17_29_19/0.35)] ring-1 ring-border">
          {/* The app at its real sizes, zoomed out to fit the window. */}
          <div className="[zoom:0.6] sm:[zoom:0.62] lg:[zoom:0.72] [&_.bg-muted>img]:size-full">
            <header className="border-b bg-card">
              <div className="flex h-18 items-center gap-6 px-8">
                <Logo />
                <nav className="hidden gap-1 sm:flex">
                  {[
                    { label: 'My lists', Icon: ListIcon, active: view === 'owner' },
                    { label: 'Family', Icon: UsersIcon, active: view === 'family' },
                    { label: 'Reserved by me', Icon: GiftIcon, active: false },
                  ].map(({ label, Icon, active }) => (
                    <span key={label} className={cn('flex items-center gap-2 rounded-lg px-4 py-2 font-medium transition-colors duration-500', active && 'bg-accent text-primary')}>
                      <Icon className="size-5" /> {label}
                    </span>
                  ))}
                </nav>
                <Avatar name="Anna" background={false} className="ml-auto size-12" />
              </div>
            </header>

            {/* Both pages share one grid cell and cross-fade, so the window keeps its size. */}
            <div className="grid *:col-start-1 *:row-start-1 *:transition-[opacity,translate,filter,visibility] *:duration-500 *:ease-[cubic-bezier(0.2,0.8,0.2,1)] motion-reduce:*:transition-none">
              <Layer shown={view === 'owner'}>
                <div className="grid gap-10 px-8 py-10 lg:grid-cols-[16rem_1fr]">
                  <aside className="hidden space-y-1 lg:block">
                    <p className="mb-3 text-sm font-semibold tracking-widest text-muted-foreground uppercase">My lists</p>
                    <span className="flex items-center gap-3 rounded-xl bg-primary px-4 py-3 font-semibold text-primary-foreground">
                      Christmas 2026 <span className="ml-auto">{wishes.length}</span>
                    </span>
                    <span className="mt-2 flex items-center gap-2 rounded-xl border border-dashed border-ring px-4 py-3 font-medium text-primary">
                      <PlusIcon className="size-5" /> New list
                    </span>
                  </aside>
                  <main className="min-w-0">
                    <div className="flex flex-wrap items-end justify-between gap-4">
                      <div>
                        <span className="rounded-full bg-brand px-3 py-1 text-sm font-semibold text-brand-foreground">Christmas</span>
                        <p className="mt-3 text-5xl font-bold tracking-tight">Christmas 2026</p>
                        <p className="mt-2 text-muted-foreground">{[`${wishes.length} wishes`, 'shared with 5 people', countdown].filter(Boolean).join(' · ')}</p>
                      </div>
                      <div className="flex gap-3">
                        <span className={buttonVariants({ variant: 'outline', className: big })}><PencilIcon /> Edit list</span>
                        <span className={buttonVariants({ variant: 'outline', className: big })}><Share2Icon /> Share</span>
                        <span className={buttonVariants({ className: big })}><PlusIcon /> Add a wish</span>
                      </div>
                    </div>
                    <div className="mt-6 flex gap-2">
                      {['All', 'Most wanted', 'Under 300 kr.'].map((f, i) => (
                        <span key={f} className={cn('rounded-lg border bg-card px-5 py-2.5 font-medium', i === 0 && 'border-primary bg-primary text-primary-foreground')}>{f}</span>
                      ))}
                    </div>
                    <div className="mt-6 grid grid-cols-2 gap-6 lg:grid-cols-3 max-lg:[&>*:nth-child(n+3)]:hidden lg:[&>*:nth-child(n+4)]:hidden">
                      {wishes.map((w) => (
                        <WishCard key={w.title} wish={w}>
                          <span className={buttonVariants({ variant: 'secondary', className: big })}>Edit</span>
                        </WishCard>
                      ))}
                    </div>
                  </main>
                </div>
              </Layer>

              <Layer shown={view === 'family'}>
                <div className="max-w-5xl px-8 py-10">
                  <div className="flex items-center gap-5">
                    <Avatar name="Anna" className="size-20" />
                    <div>
                      <span className="rounded-full bg-brand px-3 py-1 text-sm font-semibold text-brand-foreground">Christmas</span>
                      <p className="mt-3 text-5xl font-bold tracking-tight">Christmas 2026</p>
                      <p className="mt-2 text-muted-foreground">{[`${wishes.length} wishes`, '2 reserved', '2 still free', countdown].filter(Boolean).join(' · ')}</p>
                    </div>
                  </div>
                  <p className="mt-8 flex gap-3 rounded-2xl bg-brand/50 p-5 dark:bg-brand/15">
                    <EyeOffIcon className="mt-0.5 size-5 shrink-0" />
                    Anna can’t see what is reserved. Reserve a gift so nobody else in the family buys the same one.
                  </p>
                  <div className="mt-6 space-y-4">
                    {wishes.slice(0, 3).map((w) => (
                      <WishRow key={w.title} wish={w}>
                        {w.takenBy === 'you' ? (
                          <div className="flex items-center gap-4">
                            <span className="inline-flex items-center gap-2 font-semibold">
                              <CheckIcon className="size-5 rounded-full bg-brand p-0.5 text-brand-foreground" /> Reserved by you
                            </span>
                            <span className={buttonVariants({ variant: 'outline', className: big })}>Unreserve</span>
                          </div>
                        ) : w.takenBy ? (
                          <span className="inline-flex items-center gap-2 text-muted-foreground"><LockIcon className="size-4" /> Reserved by {w.takenBy}</span>
                        ) : (
                          <span className={buttonVariants({ className: big })}><GiftIcon /> Reserve this gift</span>
                        )}
                      </WishRow>
                    ))}
                  </div>
                </div>
              </Layer>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function Layer({ shown, children }: { shown: boolean; children: React.ReactNode }) {
  return <div className={cn(!shown && 'pointer-events-none invisible translate-y-2 opacity-0 blur-[2px]')}>{children}</div>
}
