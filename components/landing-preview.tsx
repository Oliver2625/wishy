'use client'

import { useState } from 'react'
import {
  ArrowUpIcon, BedDoubleIcon, CheckIcon, CookingPotIcon, DicesIcon, GiftIcon, HeadphonesIcon,
  LinkIcon, ListIcon, SettingsIcon, StarIcon, UsersIcon,
} from 'lucide-react'
import { cn } from '@/lib/utils'

const wishes = [
  { title: 'Wireless headphones', store: 'Example store · 1 299 kr', icon: HeadphonesIcon, mostWanted: true, takenBy: 'Dad' },
  { title: 'Wool blanket, grey', store: 'Example store · 649 kr', icon: BedDoubleIcon, mostWanted: true },
  { title: 'Cookbook: weeknight dinners', store: 'Example bookshop · 249 kr', icon: CookingPotIcon, takenBy: 'you' },
  { title: 'Board game for 4 players', store: 'Example toy shop · 379 kr', icon: DicesIcon },
]

const views = {
  owner: { label: 'Your view', caption: 'This is your list. Reservations stay hidden from you.' },
  family: { label: 'Your family’s view', caption: 'Family see what’s taken, so nobody buys the same gift.' },
}
type View = keyof typeof views

// The hero's interactive picture of the product: the same list seen by its owner and by family.
// The window itself is decorative (aria-hidden); the toggle and its caption carry the meaning.
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

      <div aria-hidden className="mt-6 w-full select-none">
        <div className="mx-auto overflow-hidden rounded-3xl bg-card text-left shadow-[0_30px_80px_-30px_rgb(17_29_19/0.35)] ring-1 ring-border">
          <div className="grid grid-cols-1 lg:grid-cols-[3.5rem_minmax(0,1fr)_17rem]">
            {/* App rail */}
            <div className="hidden flex-col items-center gap-5 border-r bg-secondary/60 py-5 text-muted-foreground lg:flex">
              <span className="grid size-8 place-items-center rounded-lg bg-brand text-brand-foreground"><ListIcon className="size-4" /></span>
              <UsersIcon className="size-4" />
              <GiftIcon className="size-4" />
              <SettingsIcon className="mt-auto size-4" />
            </div>

            {/* The list */}
            <div className="p-4 sm:p-6">
              <div className="mb-4 flex items-center justify-between gap-3">
                <p className="text-lg font-bold tracking-tight">Christmas 2026</p>
                {countdown && <span className="rounded-full bg-secondary px-3 py-1 text-xs font-medium text-secondary-foreground">{countdown}</span>}
              </div>
              <ul className="space-y-2.5">
                {wishes.map((w) => (
                  <li key={w.title} className="flex items-center gap-3 rounded-2xl border bg-card p-2.5 pr-3">
                    <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-muted text-primary">
                      <w.icon className="size-5" />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-sm font-semibold">{w.title}</span>
                      <span className="block truncate text-xs text-muted-foreground">{w.store}</span>
                    </span>
                    {/* Both states share one grid cell and cross-fade, so the row never jumps. */}
                    <span className="grid shrink-0 justify-items-end *:col-start-1 *:row-start-1 *:transition-all *:duration-500 *:ease-[cubic-bezier(0.2,0.8,0.2,1)] motion-reduce:*:transition-none">
                      <Chip shown={view === 'owner'}>
                        {w.mostWanted
                          ? <span className="inline-flex items-center gap-1 rounded-full bg-brand px-2.5 py-1 text-xs font-semibold text-brand-foreground"><StarIcon className="size-3 fill-current" /> Most wanted</span>
                          : <span className="rounded-full bg-secondary px-2.5 py-1 text-xs font-medium text-secondary-foreground">Nice to have</span>}
                      </Chip>
                      <Chip shown={view === 'family'}>
                        {w.takenBy === 'you'
                          ? <span className="inline-flex items-center gap-1 rounded-full bg-primary px-2.5 py-1 text-xs font-semibold text-primary-foreground"><CheckIcon className="size-3" /> Reserved by you</span>
                          : w.takenBy
                            ? <span className="rounded-full bg-ink px-2.5 py-1 text-xs font-semibold text-ink-foreground">Reserved by {w.takenBy}</span>
                            : <span className="rounded-full border border-field px-2.5 py-1 text-xs font-semibold text-primary">Reserve</span>}
                      </Chip>
                    </span>
                  </li>
                ))}
              </ul>
              <p className="mt-3 flex items-center gap-2 px-1 text-xs text-muted-foreground">
                <span className="flex gap-1 *:size-1.5 *:rounded-full *:bg-chart-3 motion-safe:*:animate-pulse">
                  <span /><span className="[animation-delay:150ms]" /><span className="[animation-delay:300ms]" />
                </span>
                Fetching name, price and photo…
              </p>
              <div className="mt-3 flex items-center gap-2 rounded-full border bg-secondary/60 py-1.5 pr-1.5 pl-4 text-sm text-muted-foreground">
                <LinkIcon className="size-4" />
                <span className="flex-1 truncate">Paste a link to add a wish</span>
                <span className="grid size-8 place-items-center rounded-full bg-ink text-ink-foreground"><ArrowUpIcon className="size-4" /></span>
              </div>
            </div>

            {/* Side panel: who the list is shared with, and what happened today */}
            <div className="hidden border-l bg-secondary/40 p-6 lg:block">
              <div className="flex flex-col items-center text-center">
                <span className="grid size-16 place-items-center rounded-full bg-brand text-2xl font-bold text-brand-foreground ring-4 ring-card">A</span>
                <p className="mt-3 font-semibold">Your list</p>
                <p className="text-xs text-muted-foreground">Shared with 5 people</p>
                <div className="mt-4 flex gap-2 text-xs">
                  <span className="rounded-full bg-card px-3 py-1 ring-1 ring-border">4 wishes</span>
                  <span className="rounded-full bg-card px-3 py-1 ring-1 ring-border">Family · 5</span>
                </div>
              </div>
              <p className="mt-8 text-xs font-semibold tracking-widest text-muted-foreground uppercase">Today</p>
              <ul className="mt-3 space-y-3 text-xs">
                {[['Jonas opened your list', '16:51'], ['Freja joined your list', '15:12'], ['Wishy added 2 photos', '13:42']].map(([what, when]) => (
                  <li key={what} className="flex gap-2.5">
                    <span className="mt-0.5 grid size-5 shrink-0 place-items-center rounded-full bg-brand text-brand-foreground"><CheckIcon className="size-3" /></span>
                    <span><span className="block font-medium">{what}</span><span className="text-muted-foreground">{when}</span></span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function Chip({ shown, children }: { shown: boolean; children: React.ReactNode }) {
  return <span className={cn(shown ? 'opacity-100' : 'pointer-events-none translate-y-1 scale-95 opacity-0 blur-[2px]')}>{children}</span>
}
