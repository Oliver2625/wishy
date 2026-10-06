import { ImageIcon, StarIcon } from 'lucide-react'
import type { Wish } from '@/lib/lists'
import { cn } from '@/lib/utils'

export type CardWish = Pick<Wish, 'title' | 'store' | 'url' | 'price' | 'priority' | 'note' | 'image_url'>

// Staggered entrance for list items. CSS only (tw-animate-css), skipped when reduced motion is on.
// Kept here, not in the 'use client' motion.tsx, so server components get real values.
const enter = 'motion-safe:animate-in motion-safe:fade-in motion-safe:slide-in-from-bottom-3 fill-mode-both duration-300 ease-out'
const stagger = (i: number) => ({ animationDelay: `${Math.min(i, 8) * 45}ms` })

const kr = new Intl.NumberFormat('da-DK', { style: 'currency', currency: 'DKK', maximumFractionDigits: 0 })
export const formatPrice = (p: string | number | null) => (p === null || p === '' || Number.isNaN(Number(p)) ? '' : kr.format(Number(p)))

export function Photo({ src, className }: { src: string | null; className?: string }) {
  return (
    <div className={cn('flex items-center justify-center overflow-hidden bg-muted text-ring', className)}>
      {src
        // eslint-disable-next-line @next/next/no-img-element -- arbitrary shop hosts, so no next/image allowlist
        ? <img src={src} alt="" referrerPolicy="no-referrer" className="size-full object-cover" />
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
      <StarIcon className="size-3.5 fill-current" /> Most wanted
    </span>
  )
}

// Grid card (owner view, preview, reserved-by-me).
// index: position in a list, for the staggered entrance. Omit (e.g. the form preview) to skip it.
export function WishCard({ wish, extra, children, index }: { wish: CardWish; extra?: React.ReactNode; children?: React.ReactNode; index?: number }) {
  return (
    <article
      style={index === undefined ? undefined : stagger(index)}
      className={cn('group flex flex-col overflow-hidden rounded-2xl border bg-card transition-[translate,box-shadow,border-color] duration-200 hover:border-ring/60 hover:shadow-lg hover:shadow-primary/5 motion-safe:hover:-translate-y-0.5', index !== undefined && enter)}
    >
      <div className="relative">
        <Photo src={wish.image_url} className="h-44 *:transition-transform *:duration-500 motion-safe:group-hover:*:scale-[1.03]" />
        {wish.priority === 3 && <MostWanted className="absolute top-3 left-3" />}
      </div>
      <div className="flex flex-1 flex-col p-5">
        <h3 className="text-lg font-semibold">{wish.title ? <Title wish={wish} /> : <span className="text-muted-foreground">Your wish</span>}</h3>
        {wish.store && <p className="text-muted-foreground">{wish.store}</p>}
        {extra}
        <div className="mt-auto flex items-center justify-between gap-2 pt-4">
          <span className="text-xl font-bold">{formatPrice(wish.price)}</span>
          {children}
        </div>
        {wish.note && <p className="mt-4 rounded-xl bg-secondary px-4 py-3 text-sm">{wish.note}</p>}
      </div>
    </article>
  )
}

// Row (family view of someone else's list).
export function WishRow({ wish, children, index }: { wish: CardWish; children?: React.ReactNode; index?: number }) {
  const meta = [wish.store, formatPrice(wish.price)].filter(Boolean).join(' · ')
  return (
    <article
      style={index === undefined ? undefined : stagger(index)}
      className={cn('flex flex-wrap items-center gap-5 rounded-2xl border bg-card p-4 transition-[border-color,box-shadow] duration-200 hover:border-ring/60 hover:shadow-md hover:shadow-primary/5 sm:flex-nowrap', index !== undefined && enter)}
    >
      <Photo src={wish.image_url} className="size-24 shrink-0 rounded-xl" />
      <div className="min-w-0 flex-1">
        {wish.priority === 3 && <MostWanted className="mb-1.5 px-2 py-0.5 text-xs" />}
        <h3 className="text-lg font-semibold"><Title wish={wish} /></h3>
        {meta && <p className="text-muted-foreground">{meta}</p>}
        {wish.note && <p className="mt-2">&ldquo;{wish.note}&rdquo;</p>}
      </div>
      <div className="flex w-full items-center justify-end gap-4 sm:w-auto">{children}</div>
    </article>
  )
}

export function Avatar({ name, className }: { name: string; className?: string }) {
  return (
    <span className={cn('flex size-8 shrink-0 items-center justify-center rounded-full bg-muted font-semibold text-foreground', className)} title={name}>
      {name.trim()[0]?.toUpperCase()}
    </span>
  )
}
