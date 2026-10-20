import { Blobatar } from '@blobatar/react'
import { CheckIcon, ImageIcon, LockIcon, StarIcon } from 'lucide-react'
import type { Wish } from '@/lib/lists'
import { cn } from '@/lib/utils'
import { formatPrice } from '@/lib/currency'

export type CardWish = Pick<Wish, 'title' | 'store' | 'url' | 'price' | 'currency' | 'priority' | 'note' | 'image_url'>

// Staggered entrance for list items. CSS only (tw-animate-css), skipped when reduced motion is on.
// Kept here, not in the 'use client' motion.tsx, so server components get real values.
const enter = 'motion-safe:animate-in motion-safe:fade-in motion-safe:slide-in-from-bottom-3 fill-mode-both duration-300 ease-out'
const stagger = (i: number) => ({ animationDelay: `${Math.min(i, 8) * 45}ms` })


export function Photo({ src, className }: { src: string | null; className?: string }) {
  return (
    <div className={cn('flex items-center justify-center overflow-hidden bg-muted text-ring', className)}>
      {src
        // eslint-disable-next-line @next/next/no-img-element -- arbitrary shop hosts, so no next/image allowlist
        ? <img src={src} alt="" referrerPolicy="no-referrer" className="object-cover object-center" />
        : <ImageIcon className="size-8" />}
    </div>
  )
}

const Title = ({ wish }: { wish: CardWish }) =>
  wish.url
    ? <a href={wish.url} target="_blank" rel="noopener noreferrer" className="hover:underline">{wish.title}</a>
    : <>{wish.title}</>

export function MostWanted({ className }: { className?: string }) {
  return (
    <span className={cn('inline-flex items-center gap-1.5 rounded-full bg-brand px-3 py-1 text-sm font-semibold text-brand-foreground', className)}>
      <StarIcon className="size-3.5 fill-current text-yellow-400" /> Most wanted
    </span>
  )
}

// Grid card (owner view, preview, reserved-by-me). No hover lift: only the title link and the buttons are clickable, not the card.
// index: position in a list, for the staggered entrance. Omit (e.g. the form preview) to skip it.
export function WishCard({ wish, extra, children, index, className }: { wish: CardWish; extra?: React.ReactNode; children?: React.ReactNode; index?: number; className?: string }) {
  return (
    <article
      style={index === undefined ? undefined : stagger(index)}
      className={cn('flex flex-col overflow-hidden rounded-2xl border bg-card', index !== undefined && enter, className)}
    >
      <div className="relative">
        <Photo src={wish.image_url} className="h-44" />
        {wish.priority === 3 && <MostWanted className="absolute top-3 left-3" />}
      </div>
      <div className="flex flex-1 flex-col p-5">
        <h3 className="text-lg font-semibold">{wish.title ? <Title wish={wish} /> : <span className="text-muted-foreground">Your wish</span>}</h3>
        {wish.store && <p className="text-muted-foreground">{wish.store}</p>}
        {extra}
        <div className="mt-auto flex items-center justify-between gap-2 pt-4">
          <span className="text-xl font-bold">{formatPrice(wish.price, wish.currency)}</span>
          {children}
        </div>
        {wish.note && <p className="mt-4 rounded-xl bg-secondary px-4 py-3 text-sm">{wish.note}</p>}
      </div>
    </article>
  )
}

// Card for someone else's list (family view). The state shows in the card itself, so free gifts are easy to scan for:
// yours get a ring, ones taken by others go quiet. children: the action (Reserve / Unreserve).
export type GiftState = 'free' | 'mine' | 'taken'
export function GiftCard({ wish, state, reserver, children, index }: { wish: CardWish; state: GiftState; reserver?: string | null; children?: React.ReactNode; index?: number }) {
  return (
    <WishCard
      wish={wish}
      index={index}
      className={cn(state === 'mine' && 'border-primary ring-2 ring-primary/30', state === 'taken' && 'bg-card/60 [&_img]:opacity-60 [&_img]:grayscale')}
      extra={state === 'mine'
        ? <p className="mt-2 flex items-center gap-1.5 text-sm font-semibold text-primary"><CheckIcon className="size-4 rounded-full bg-brand p-0.5 text-brand-foreground" /> Reserved by you</p>
        : state === 'taken' && <p className="mt-2 flex items-center gap-1.5 text-sm text-muted-foreground"><LockIcon className="size-3.5" /> Reserved{reserver && ` by ${reserver}`}</p>}
    >
      {children}
    </WishCard>
  )
}

// Blobatar: a deterministic blob from the name, rendered as a static <img> (no client JS, so fine in server components).
// Size it with className; size={96} is just the SVG's resolution. alt="": the name is always shown next to it or in the title.
// background: false drops the blob's circle, for places that frame it themselves (the header).
// dark:brightness-80: blobatar's colors don't follow our theme and pale discs (e.g. #f6f3ec) glow on the dark
// page. Dimming the whole image keeps the face's own contrast, which recoloring the disc would not (HIG dark-mode.md).
export function Avatar({ name, className, background = true }: { name: string; className?: string; background?: boolean }) {
  return <Blobatar name={name} size={96} background={background && 'circle'} alt="" title={name} className={cn('size-8 shrink-0 rounded-full dark:brightness-80', className)} />
}
