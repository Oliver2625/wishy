import type { Metadata } from 'next'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import {
  ArrowDownIcon, BabyIcon, CakeIcon, CalendarHeartIcon, CheckIcon, ChevronDownIcon, EyeOffIcon,
  GemIcon, LinkIcon, LockIcon, SparklesIcon, StarIcon, TreePineIcon, XIcon,
} from 'lucide-react'
import { LandingPreview } from '@/components/landing-preview'
import { Logo } from '@/components/logo'
import { getMember } from '@/lib/auth'
import { daysToGo } from '@/lib/occasions'
import { cn } from '@/lib/utils'

export const metadata: Metadata = {
  title: { absolute: 'Wishy · Every wish in one place' },
  description: 'Save anything you wish for, share the list with family, and let them reserve gifts. You never see what’s taken.',
}

const primary = 'inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-ink px-6 font-semibold text-ink-foreground transition-[transform,box-shadow] duration-300 ease-[cubic-bezier(0.2,0.8,0.2,1)] outline-none hover:shadow-lg hover:shadow-ink/20 focus-visible:ring-3 focus-visible:ring-ring/60 motion-safe:hover:-translate-y-0.5 motion-safe:active:translate-y-0'
const secondary = 'group inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-card px-6 font-semibold ring-1 ring-border transition-colors duration-300 outline-none hover:bg-secondary focus-visible:ring-3 focus-visible:ring-ring/60'
const card = 'rounded-3xl bg-card p-6 ring-1 ring-border transition-[transform,box-shadow] duration-500 ease-[cubic-bezier(0.2,0.8,0.2,1)] hover:shadow-xl hover:shadow-ink/5 motion-safe:hover:-translate-y-1 sm:p-8'

const steps = [
  { title: 'Save it', body: 'Paste a link from any shop. Wishy fills in the name, price and photo, or you type them yourself.' },
  { title: 'Share it', body: 'Send one link or invite family by email. They see every wish, with your notes on size and colour.' },
  { title: 'Let them reserve', body: 'Family reserve what they’ll buy, so nobody doubles up. You stay surprised until the day.' },
]

const compare = [
  { what: 'Everyone sees the same list', chat: false, notes: true },
  { what: 'Links, prices and photos in one place', chat: false, notes: false },
  { what: 'Family can reserve gifts', chat: false, notes: false },
  { what: 'No two people buy the same gift', chat: false, notes: false },
  { what: 'The surprise is kept from you', chat: false, notes: false },
]

// Tints from the palette, darkest last, so the row reads as one family of colours.
const occasions = [
  { name: 'Birthdays', body: 'Sizes, colours and the one thing they keep mentioning.', icon: CakeIcon, tint: 'bg-[#a1cca5] text-[#111d13]' },
  { name: 'Christmas', body: 'One list per person, shared with the whole family.', icon: TreePineIcon, tint: 'bg-[#415d43] text-[#eff5ee]' },
  { name: 'Weddings', body: 'A registry guests can actually use.', icon: GemIcon, tint: 'bg-[#c9e0c8] text-[#111d13]' },
  { name: 'New baby', body: 'The practical things, so nobody gets five of the same.', icon: BabyIcon, tint: 'bg-[#709775] text-[#111d13]' },
  { name: 'Just because', body: 'Save it now, so the right gift is ready later.', icon: SparklesIcon, tint: 'bg-[#111d13] text-[#a1cca5]' },
]

const faq = [
  { q: 'Can I see who reserved my gifts?', a: 'Not by default. On your own lists, reservations are hidden from you, so the surprise holds. Family can see who took what, so they don’t double up, and you can change both settings per list.' },
  { q: 'Does my family need an account?', a: 'Yes, but there’s no password. Wishy is invite-only: you share a list with someone’s email, and they sign in with a code sent to that address.' },
  { q: 'Which shops work?', a: 'Most of them. Paste a product link and Wishy reads the name, price and photo from the page. If a shop doesn’t share them, you fill them in yourself.' },
  { q: 'Can I keep a list private?', a: 'Every list starts private. Only you can see it until you share it, and you choose exactly who it’s shared with.' },
  { q: 'What does Wishy cost?', a: 'Nothing. Wishy is a family project with no ads and no paid plans.' },
]

export default async function Landing() {
  // Members go straight to their lists; everyone else gets the introduction.
  if (await getMember()) redirect('/lists')

  const now = new Date()
  const countdown = daysToGo(`${now.getFullYear()}-12-24`, now)

  return (
    <div className="landing flex flex-1 flex-col">
      <header className="landing-header sticky top-0 z-40 border-b border-border bg-background/80 backdrop-blur-xl backdrop-saturate-150">
        <div className="mx-auto flex h-16 max-w-6xl items-center gap-6 px-4 sm:px-8">
          <Link href="/" className="flex items-center gap-2 text-lg font-bold tracking-tight">
            <Logo className="size-8" /> Wishy
          </Link>
          <nav aria-label="Sections" className="hidden gap-1 text-sm font-medium text-muted-foreground md:flex">
            {[['#how', 'How it works'], ['#features', 'Features'], ['#occasions', 'Occasions'], ['#faq', 'FAQ']].map(([href, label]) => (
              <a key={href} href={href} className="rounded-full px-3 py-2 transition-colors hover:bg-secondary hover:text-foreground">{label}</a>
            ))}
          </nav>
          <div className="ml-auto flex items-center gap-1 sm:gap-2">
            <Link href="/login" className="inline-flex min-h-11 items-center rounded-full px-4 text-sm font-semibold transition-colors hover:bg-secondary">Log in</Link>
            <Link href="/login" className={cn(primary, 'min-h-11 px-5 text-sm')}>Get started</Link>
          </div>
        </div>
      </header>

      <main className="flex-1">
        {/* Hero */}
        <section className="relative overflow-hidden px-4 pt-16 pb-24 sm:px-8 sm:pt-24">
          <div aria-hidden className="pointer-events-none absolute inset-x-0 -top-40 -z-10 mx-auto h-[36rem] max-w-4xl rounded-full bg-brand/40 blur-3xl dark:bg-brand/10" />
          <div className="mx-auto flex max-w-3xl flex-col items-center text-center">
            <p className="rise inline-flex items-center gap-2 rounded-full bg-card py-1.5 pr-4 pl-1.5 text-sm font-medium shadow-sm ring-1 ring-border">
              <span className="grid size-6 place-items-center rounded-full bg-brand"><Logo className="size-4" /></span>
              Wishlists for the whole family
            </p>
            <h1 style={{ '--i': 1 } as React.CSSProperties} className="rise mt-6 text-5xl font-bold tracking-[-0.045em] text-balance sm:text-7xl sm:leading-[1.02]">
              Every wish in one place. <span className="text-primary">Every gift a surprise.</span>
            </h1>
            <p style={{ '--i': 2 } as React.CSSProperties} className="rise mt-6 max-w-xl text-lg text-pretty text-muted-foreground">
              Save anything you wish for, share the list with family, and let them reserve gifts. You never see what’s taken.
            </p>
            <div style={{ '--i': 3 } as React.CSSProperties} className="rise mt-8 flex flex-wrap justify-center gap-3">
              <Link href="/login" className={primary}>Create your first list</Link>
              <a href="#how" className={secondary}>
                See how it works <ArrowDownIcon className="size-4 transition-transform duration-300 motion-safe:group-hover:translate-y-0.5" />
              </a>
            </div>
            <p style={{ '--i': 3 } as React.CSSProperties} className="rise mt-4 text-sm text-muted-foreground">
              Wishy is invite-only. Ask the person who runs your family’s Wishy to add your email.
            </p>
          </div>
          <div style={{ '--i': 4 } as React.CSSProperties} className="rise mx-auto mt-14 max-w-5xl">
            <LandingPreview countdown={countdown} />
          </div>
        </section>

        {/* How it works */}
        <section id="how" aria-labelledby="how-title" className="bg-card px-4 py-24 sm:px-8">
          <div className="mx-auto max-w-6xl">
            <div className="reveal mx-auto max-w-2xl text-center">
              <p className="text-sm font-semibold tracking-widest text-muted-foreground uppercase">How it works</p>
              <h2 id="how-title" className="mt-3 text-4xl font-bold tracking-[-0.035em] text-balance sm:text-5xl">Three steps between a wish and a gift.</h2>
            </div>
            <ol className="mt-14 grid gap-4 md:grid-cols-3">
              {steps.map((s, i) => (
                <li key={s.title} className={cn(card, 'reveal bg-secondary/70 ring-0')}>
                  <span className="text-5xl font-bold tracking-tighter text-chart-3 tabular-nums">0{i + 1}</span>
                  <h3 className="mt-8 text-xl font-bold tracking-tight">{s.title}</h3>
                  <p className="mt-2 text-muted-foreground">{s.body}</p>
                </li>
              ))}
            </ol>
          </div>
        </section>

        {/* Features */}
        <section id="features" aria-labelledby="features-title" className="px-4 py-24 sm:px-8">
          <div className="mx-auto max-w-6xl">
            <h2 id="features-title" className="reveal max-w-xl text-4xl font-bold tracking-[-0.035em] text-balance sm:text-5xl">Built for how families actually give gifts.</h2>

            <div className="reveal mt-12 grid items-center gap-8 rounded-[2rem] bg-ink p-8 text-ink-foreground sm:p-12 lg:grid-cols-2">
              <div>
                <EyeOffIcon className="size-8 text-brand" />
                <h3 className="mt-6 text-3xl font-bold tracking-tight sm:text-4xl">Surprises stay surprises.</h3>
                <p className="mt-4 max-w-md text-lg text-ink-foreground/75">Your family sees what’s reserved and by whom. You only ever see your wishes, never what’s been taken.</p>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="rounded-2xl bg-card p-5 text-card-foreground transition-transform duration-500 motion-safe:-rotate-2 motion-safe:hover:rotate-0">
                  <p className="text-xs font-medium text-muted-foreground">What you see</p>
                  <p className="mt-3 font-semibold">Wireless headphones</p>
                  <span className="mt-3 inline-flex items-center gap-1 rounded-full bg-brand px-2.5 py-1 text-xs font-semibold text-brand-foreground"><StarIcon className="size-3 fill-current" /> On your list</span>
                </div>
                <div className="rounded-2xl bg-brand p-5 text-brand-foreground transition-transform duration-500 motion-safe:rotate-2 motion-safe:hover:rotate-0">
                  <p className="text-xs font-medium text-brand-foreground/75">What Mum sees</p>
                  <p className="mt-3 font-semibold">Wireless headphones</p>
                  <span className="mt-3 inline-flex rounded-full bg-[#111d13] px-2.5 py-1 text-xs font-semibold text-[#eff5ee]">Reserved by Dad</span>
                </div>
              </div>
            </div>

            <div className="mt-4 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              <article className={cn(card, 'reveal')}>
                <LinkIcon className="size-6 text-primary" />
                <h3 className="mt-5 text-xl font-bold tracking-tight">Paste a link. Done.</h3>
                <p className="mt-2 text-muted-foreground">Name, price and photo come in by themselves. Add a note like “size M” so nobody has to guess.</p>
                <div aria-hidden className="mt-6 rounded-2xl border bg-secondary/50 p-3 text-sm">
                  <p className="truncate rounded-xl bg-card px-3 py-2 text-muted-foreground ring-1 ring-border">https://example-store.com/blanket</p>
                  <div className="mt-2 flex items-center gap-3 px-1">
                    <span className="size-10 shrink-0 rounded-lg bg-muted" />
                    <span><span className="block font-semibold">Wool blanket, grey</span><span className="text-xs text-muted-foreground">Example store · 649 kr</span></span>
                  </div>
                </div>
              </article>
              <article className={cn(card, 'reveal')}>
                <CheckIcon className="size-6 text-primary" />
                <h3 className="mt-5 text-xl font-bold tracking-tight">Never the same gift twice.</h3>
                <p className="mt-2 text-muted-foreground">One tap reserves a gift. Everyone else sees it’s taken, so there are no awkward doubles.</p>
                <div aria-hidden className="mt-6 rounded-2xl border bg-secondary/50 p-4 text-sm">
                  <p className="font-semibold">Board game for 4 players</p>
                  <p className="text-xs text-muted-foreground">Example toy shop · 379 kr</p>
                  <span className="mt-3 inline-flex items-center gap-1 rounded-full bg-primary px-3 py-1 text-xs font-semibold text-primary-foreground"><CheckIcon className="size-3" /> Reserved by you</span>
                </div>
              </article>
              <article className={cn(card, 'reveal')}>
                <CalendarHeartIcon className="size-6 text-primary" />
                <h3 className="mt-5 text-xl font-bold tracking-tight">A countdown to the day.</h3>
                <p className="mt-2 text-muted-foreground">Give a list a date and everyone sees how long is left, so the shopping doesn’t all happen on the 23rd.</p>
              </article>
              <article className={cn(card, 'reveal lg:col-span-1')}>
                <LockIcon className="size-6 text-primary" />
                <h3 className="mt-5 text-xl font-bold tracking-tight">Private until you’re ready.</h3>
                <p className="mt-2 text-muted-foreground">Keep a list to yourself while you fill it in, then share it with exactly the people you choose.</p>
              </article>
              <article className={cn(card, 'reveal md:col-span-2')}>
                <StarIcon className="size-6 text-primary" />
                <h3 className="mt-5 text-xl font-bold tracking-tight">Say what matters most.</h3>
                <p className="mt-2 max-w-lg text-muted-foreground">Mark a wish as most wanted, would love or nice to have, so family knows where to start.</p>
              </article>
            </div>
          </div>
        </section>

        {/* Comparison */}
        <section aria-labelledby="compare-title" className="bg-card px-4 py-24 sm:px-8">
          <div className="mx-auto max-w-4xl">
            <h2 id="compare-title" className="reveal text-center text-3xl font-bold tracking-[-0.035em] text-balance sm:text-5xl">
              A group chat keeps track of nothing. <span className="text-primary">Wishy keeps track of everything.</span>
            </h2>
            <div className="reveal mt-12">
              <table className="w-full border-separate border-spacing-0 text-sm">
                <thead>
                  <tr>
                    <th scope="col" className="sr-only">Feature</th>
                    <th scope="col" className="w-16 py-4 text-xs font-semibold text-muted-foreground sm:w-32 sm:text-sm">Group chat</th>
                    <th scope="col" className="w-16 py-4 text-xs font-semibold text-muted-foreground sm:w-32 sm:text-sm">Notes app</th>
                    <th scope="col" className="w-16 rounded-t-2xl bg-ink py-4 text-xs font-semibold text-ink-foreground sm:w-32 sm:text-sm">Wishy</th>
                  </tr>
                </thead>
                <tbody>
                  {compare.map((r, i) => (
                    <tr key={r.what}>
                      <th scope="row" className="border-t py-4 pr-4 text-left font-medium">{r.what}</th>
                      <Mark yes={r.chat} />
                      <Mark yes={r.notes} />
                      <td className={cn('border-t border-ink/10 bg-brand/40 text-center dark:bg-brand/15', i === compare.length - 1 && 'rounded-b-2xl')}>
                        <CheckIcon aria-label="Yes" className="mx-auto size-5 text-primary" />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>

        {/* Occasions */}
        <section id="occasions" aria-labelledby="occasions-title" className="px-4 py-24 sm:px-8">
          <div className="mx-auto max-w-6xl">
            <div className="reveal flex flex-wrap items-end justify-between gap-4">
              <h2 id="occasions-title" className="max-w-md text-4xl font-bold tracking-[-0.035em] text-balance sm:text-5xl">One app for every occasion.</h2>
              <p className="max-w-xs text-muted-foreground">Make a list for each one, and share each with the people it’s for.</p>
            </div>
            {/* Phones swipe through the occasions; wide screens see them all. */}
            <ul className="-mx-4 mt-12 flex snap-x snap-mandatory gap-3 overflow-x-auto px-4 pb-4 [scrollbar-width:none] sm:-mx-8 sm:px-8 lg:mx-0 lg:grid lg:grid-cols-5 lg:overflow-visible lg:px-0">
              {occasions.map((o) => (
                <li key={o.name} className="reveal group w-[70%] shrink-0 snap-start overflow-hidden rounded-3xl bg-card ring-1 ring-border sm:w-[40%] lg:w-auto">
                  <div className={cn('grid aspect-[4/3] place-items-center', o.tint)}>
                    <o.icon aria-hidden className="size-12 transition-transform duration-500 ease-[cubic-bezier(0.2,0.8,0.2,1)] motion-safe:group-hover:scale-110 motion-safe:group-hover:-rotate-6" strokeWidth={1.5} />
                  </div>
                  <div className="p-5">
                    <h3 className="font-bold tracking-tight">{o.name}</h3>
                    <p className="mt-1 text-sm text-muted-foreground">{o.body}</p>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* FAQ */}
        <section id="faq" aria-labelledby="faq-title" className="px-4 pb-24 sm:px-8">
          <div className="mx-auto max-w-2xl">
            <h2 id="faq-title" className="reveal text-center text-4xl font-bold tracking-[-0.035em] sm:text-5xl">Your questions, answered.</h2>
            <div className="mt-10 space-y-3">
              {faq.map((f) => (
                <details key={f.q} name="faq" className="reveal group rounded-2xl bg-card ring-1 ring-border transition-shadow open:shadow-lg open:shadow-ink/5">
                  <summary className="flex min-h-14 cursor-pointer list-none items-center justify-between gap-4 rounded-2xl px-5 font-semibold outline-none focus-visible:ring-3 focus-visible:ring-ring/50 [&::-webkit-details-marker]:hidden">
                    {f.q}
                    <ChevronDownIcon aria-hidden className="size-5 shrink-0 text-muted-foreground transition-transform duration-300 group-open:rotate-180" />
                  </summary>
                  <p className="px-5 pb-5 text-muted-foreground">{f.a}</p>
                </details>
              ))}
            </div>
          </div>
        </section>

        {/* Closing call to action */}
        <section className="px-4 pb-24 sm:px-8">
          <div className="reveal relative mx-auto max-w-6xl overflow-hidden rounded-[2rem] bg-ink px-6 py-20 text-center text-ink-foreground">
            <div aria-hidden className="pointer-events-none absolute -bottom-32 left-1/2 h-64 w-[40rem] -translate-x-1/2 rounded-full bg-brand/25 blur-3xl" />
            <h2 className="relative text-4xl font-bold tracking-[-0.035em] text-balance sm:text-6xl">Start your first wishlist.</h2>
            <p className="relative mt-4 text-lg text-ink-foreground/75">It takes a minute. Your family will thank you in December.</p>
            <Link href="/login" className={cn(primary, 'relative mt-8 bg-brand text-brand-foreground hover:shadow-brand/30')}>Create your first list</Link>
          </div>
        </section>
      </main>

      <footer className="border-t px-4 py-12 sm:px-8">
        <div className="mx-auto flex max-w-6xl flex-wrap items-start justify-between gap-8 text-sm">
          <div>
            <p className="flex items-center gap-2 text-lg font-bold tracking-tight"><Logo className="size-7" /> Wishy</p>
            <p className="mt-2 max-w-56 text-muted-foreground">Wishlists for families who would rather be surprised.</p>
          </div>
          <nav aria-label="Footer" className="grid grid-cols-2 gap-x-12 gap-y-2 text-muted-foreground">
            <a href="#how" className="hover:text-foreground">How it works</a>
            <a href="#features" className="hover:text-foreground">Features</a>
            <a href="#occasions" className="hover:text-foreground">Occasions</a>
            <a href="#faq" className="hover:text-foreground">FAQ</a>
            <Link href="/login" className="hover:text-foreground">Log in</Link>
          </nav>
        </div>
        <p className="mx-auto mt-10 max-w-6xl text-xs text-muted-foreground">© {now.getFullYear()} Wishy</p>
      </footer>
    </div>
  )
}

function Mark({ yes }: { yes: boolean }) {
  return (
    <td className="border-t text-center">
      {yes
        ? <CheckIcon aria-label="Yes" className="mx-auto size-5 text-primary" />
        : <XIcon aria-label="No" className="mx-auto size-5 text-muted-foreground/60" />}
    </td>
  )
}
