import type { Metadata } from 'next'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import { ArrowDownIcon, CheckIcon, ChevronDownIcon, LinkIcon, StarIcon, XIcon } from 'lucide-react'
import { LandingMotion } from '@/components/landing-motion'
import { LandingPhone } from '@/components/landing-phone'
import { LandingPreview } from '@/components/landing-preview'
import { Logo } from '@/components/logo'
import { Avatar, type CardWish, GiftCard, WishCard } from '@/components/wish-card'
import { getMember } from '@/lib/auth'
import { daysToGo } from '@/lib/occasions'
import { cn } from '@/lib/utils'

export const metadata: Metadata = {
  title: { absolute: 'Wishy · Every wish in one place' },
  description: 'Save anything you wish for, share the list with family, and let them reserve gifts. You never see what’s taken.',
}

// One container for the page: 1312px of content at 1440, gutters grow past it.
const wrap = 'mx-auto w-full max-w-[82rem] px-4 sm:px-8 lg:px-16'
const primary = 'inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-ink px-6 font-semibold text-ink-foreground transition-[transform,background-color] duration-200 ease-settle outline-none hover:bg-primary focus-visible:ring-3 focus-visible:ring-ring active:scale-[0.98] motion-safe:hover:-translate-y-px'
const secondary = 'group inline-flex min-h-12 items-center justify-center gap-2 rounded-full px-6 font-semibold ring-1 ring-field transition-colors duration-200 outline-none hover:bg-secondary focus-visible:ring-3 focus-visible:ring-ring active:bg-muted'
const navLink = 'rounded-full px-3 py-2 transition-colors duration-200 outline-none hover:bg-secondary hover:text-foreground focus-visible:ring-3 focus-visible:ring-ring'

const steps = [
  { title: 'Save it', body: 'Paste a link from any shop. Wishy fills in the name, price and photo, or you type them yourself.' },
  { title: 'Share it', body: 'Send one link or invite family by email. They see every wish, with your notes on size and colour.' },
  { title: 'Let them reserve', body: 'Family reserve what they’ll buy, so nobody doubles up. You stay surprised until the day.' },
]

const features = [
  { title: 'Paste a link. Done.', body: 'Name, price and photo come in by themselves. Add a note like “size M” so nobody has to guess.' },
  { title: 'Never the same gift twice.', body: 'One tap reserves a gift. Everyone else sees it’s taken, so there are no awkward doubles.' },
  { title: 'A countdown to the day.', body: 'Give a list a date and everyone sees how long is left, so the shopping doesn’t all happen on the 23rd.' },
  { title: 'Private until you’re ready.', body: 'Keep a list to yourself while you fill it in, then share it with exactly the people you choose.' },
  { title: 'Say what matters most.', body: 'Mark a wish as most wanted, would love or nice to have, so family knows where to start.' },
]

const compare = [
  { what: 'Everyone sees the same list', chat: false, notes: true },
  { what: 'Links, prices and photos in one place', chat: false, notes: false },
  { what: 'Family can reserve gifts', chat: false, notes: false },
  { what: 'No two people buy the same gift', chat: false, notes: false },
  { what: 'The surprise is kept from you', chat: false, notes: false },
]

// Surfaces from the palette tokens, lightest to darkest, so the rail reads as one family.
const occasions = [
  { name: 'Birthdays', body: 'Sizes, colours and the one thing they keep mentioning.', tint: 'bg-brand text-brand-foreground' },
  { name: 'Christmas', body: 'One list per person, shared with the whole family.', tint: 'bg-primary text-primary-foreground' },
  { name: 'Weddings', body: 'A registry guests can actually use.', tint: 'bg-muted text-foreground' },
  { name: 'New baby', body: 'The practical things, so nobody gets five of the same.', tint: 'bg-chart-3 text-brand-foreground' },
  { name: 'Just because', body: 'Save it now, so the right gift is ready later.', tint: 'bg-ink text-ink-foreground' },
]

const faq = [
  { q: 'Can I see who reserved my gifts?', a: 'Not by default. On your own lists, reservations are hidden from you, so the surprise holds. Family can see who took what, so they don’t double up, and you can change both settings per list.' },
  { q: 'Does my family need an account?', a: 'Yes, but there’s no password. Wishy is invite-only: you share a list with someone’s email, and they sign in with a code sent to that address.' },
  { q: 'Which shops work?', a: 'Most of them. Paste a product link and Wishy reads the name, price and photo from the page. If a shop doesn’t share them, you fill them in yourself.' },
  { q: 'Can I keep a list private?', a: 'Every list starts private. Only you can see it until you share it, and you choose exactly who it’s shared with.' },
  { q: 'What does Wishy cost?', a: 'Nothing. Wishy is a family project with no ads and no paid plans.' },
]

// Sample wish for the step pictures. url: null so the card renders a plain title, not a link.
const headphones: CardWish = { title: 'Wireless headphones', store: 'Example electronics', url: null, price: '1299', currency: 'DKK', priority: 2, note: null, image_url: '/landing/headphones.svg' }

export default async function Landing() {
  // Members go straight to their lists; everyone else gets the introduction.
  if (await getMember()) redirect('/lists')

  const now = new Date()
  const countdown = daysToGo(`${now.getFullYear()}-12-24`, now)

  return (
    <div className="landing flex flex-1 flex-col">
      <LandingMotion />
      <header className="sticky top-0 z-40 border-b border-border bg-background">
        <div className={cn(wrap, 'flex h-16 items-center gap-6')}>
          <Link href="/" aria-label="Wishy, home" className="flex items-center gap-2 text-lg font-bold tracking-tight">
            <Logo className="size-8" /> Wishy
          </Link>
          <nav aria-label="Sections" className="hidden gap-1 text-sm font-medium text-muted-foreground md:flex">
            {[['#how', 'How it works'], ['#features', 'Features'], ['#occasions', 'Occasions'], ['#faq', 'FAQ']].map(([href, label]) => (
              <a key={href} href={href} className={navLink}>{label}</a>
            ))}
          </nav>
          <div className="ml-auto flex items-center gap-1 sm:gap-2">
            <Link href="/login" className={cn(navLink, 'inline-flex min-h-11 items-center px-3 text-sm font-semibold whitespace-nowrap sm:px-4')}>Log in</Link>
            <Link href="/login" className={cn(primary, 'min-h-11 px-4 text-sm whitespace-nowrap sm:px-5')}>Get started</Link>
          </div>
        </div>
      </header>

      <main className="flex-1">
        {/* The journey: from the hero to the table, one phone travels down the right side and its screen follows each
            section (data-screen, set by LandingMotion). Wide screens with script only; otherwise each section shows its own picture. */}
        <div className="journey">
        <div aria-hidden inert className="journey__rail">
          <div className={cn(wrap, 'grid h-full grid-cols-12 gap-8')}>
            <div className="journey__col col-span-6 col-start-7 pl-12">
              <div className="journey__phone [&>div]:mx-0"><LandingPhone countdown={countdown} journey /></div>
            </div>
          </div>
        </div>

        {/* Hero, Stage: the words on the left, the list on a phone on the right */}
        <section data-screen="hero" className="overflow-x-clip pt-14 pb-20 lg:flex lg:min-h-[calc(100svh-4rem)] lg:items-center lg:py-16">
          <div className={cn(wrap, 'grid items-center gap-10 lg:grid-cols-12 lg:gap-8')}>
            <div className="lg:col-span-6">
              <h1 className="rise max-w-[12ch] text-display font-bold tracking-[-0.04em] text-balance">
                Every wish in one place. <br className="hidden sm:block" />Every gift a surprise.
              </h1>
              <p style={{ '--i': 1 } as React.CSSProperties} className="rise mt-6 max-w-[34rem] text-lead text-pretty text-muted-foreground">
                Save anything you wish for, share the list with family, and let them reserve gifts. You never see what’s taken.
              </p>
              <div style={{ '--i': 2 } as React.CSSProperties} className="rise mt-10 flex flex-wrap gap-3">
                <Link href="/login" className={primary}>Create your first list</Link>
                <a href="#how" className={secondary}>
                  See how it works <ArrowDownIcon className="size-4 transition-transform duration-200 motion-safe:group-hover:translate-y-0.5" />
                </a>
              </div>
            </div>
            <figure style={{ '--i': 3 } as React.CSSProperties} className="hero-phone rise lg:col-span-6 lg:col-start-7 lg:pl-12 lg:[&>div]:mx-0">
              <LandingPhone countdown={countdown} />
              <figcaption className="sr-only">A Christmas list in Wishy on a phone: a striped rugby shirt and an olive rain jacket marked most wanted, each with its price and a note on size.</figcaption>
            </figure>
          </div>
        </section>

        {/* How it works: on the journey the phone shows each step; otherwise each step carries its own picture */}
        <section id="how" aria-labelledby="how-title" className="chapter border-t border-border py-[clamp(4.5rem,10vw,9rem)]">
          <div className={cn(wrap, 'chapter__grid')}>
            <div className="chapter__main">
              <h2 id="how-title" data-reveal className="max-w-[16ch] text-section font-bold tracking-[-0.035em] text-balance">Three steps between a wish and a gift.</h2>
              <ol className="mt-12">
                {steps.map((s, i) => (
                  <li key={s.title} data-screen={['save', 'share', 'reserve'][i]} className="chapter__step border-t border-border">
                    <div data-reveal>
                      <span aria-hidden className="step__num block text-display-s font-bold tracking-[-0.04em] text-chart-3 tabular-nums">{i + 1}</span>
                      <h3 className="mt-4 text-title font-bold tracking-tight">{s.title}</h3>
                      <p className="mt-3 max-w-[38ch] text-lg text-pretty text-muted-foreground">{s.body}</p>
                    </div>
                    <div aria-hidden inert className="step__visual"><StepPicture step={i} countdown={countdown} /></div>
                  </li>
                ))}
              </ol>
            </div>
          </div>
        </section>

        {/* Features, Switcher: the same list as you see it and as your family does */}
        {/* On the journey the toggle drives the phone and the preview window steps aside */}
        <section id="features" data-screen="surprise" aria-labelledby="features-title" className="journey__band bg-secondary py-[clamp(4.5rem,9vw,7.5rem)]">
          <div className={wrap}>
            <div className="jcol">
              <div data-reveal>
                <h2 id="features-title" className="text-section font-bold tracking-[-0.035em] text-balance">Surprises stay surprises.</h2>
                <p className="mt-6 max-w-[44ch] text-lead text-pretty text-muted-foreground">Your family sees what’s reserved and by whom. You only ever see your wishes, never what’s been taken.</p>
              </div>
              <div data-reveal style={{ '--i': 1 } as React.CSSProperties} className="mt-12">
                <LandingPreview countdown={countdown} />
              </div>
            </div>
          </div>
        </section>

        {/* The rest of the product, Rows: the head, then five rows parted by hairlines */}
        <section data-screen="priorities" aria-labelledby="more-title" className="py-[clamp(4.5rem,11vw,11rem)]">
          <div className={wrap}>
            <div className="jcol">
            <h2 id="more-title" data-reveal className="max-w-[16ch] text-section font-bold tracking-[-0.035em] text-balance">Built for how families actually give gifts.</h2>
            <ul className="mt-12 border-b border-border">
              {features.map((f, i) => (
                <li key={f.title} data-reveal style={{ '--i': i } as React.CSSProperties} className="grid gap-2 border-t border-border py-8 sm:grid-cols-[minmax(0,5fr)_minmax(0,6fr)] sm:gap-8">
                  <h3 className="text-title font-bold tracking-tight text-balance">{f.title}</h3>
                  <div>
                    <p className="text-pretty text-muted-foreground">{f.body}</p>
                    {i === 2 && countdown && <p className="mt-3 text-sm font-semibold text-primary tabular-nums">Christmas Eve: {countdown}</p>}
                  </div>
                </li>
              ))}
            </ul>
            </div>
          </div>
        </section>

        {/* Comparison, Table */}
        <section data-screen="reserved" aria-labelledby="compare-title" className="border-t border-border bg-card py-[clamp(4.5rem,9vw,7.5rem)]">
          <div className={wrap}>
            <div className="jcol">
            <h2 id="compare-title" data-reveal className="max-w-[22ch] text-section font-bold tracking-[-0.035em] text-balance">
              A group chat keeps track of nothing. <br className="hidden sm:block" />Wishy keeps track of everything.
            </h2>
            <div data-reveal className="mt-14">
              <table className="w-full border-separate border-spacing-0">
                <thead>
                  <tr>
                    <th scope="col" className="sr-only">Feature</th>
                    <th scope="col" className="w-20 py-4 text-sm font-semibold text-muted-foreground sm:w-32">Group chat</th>
                    <th scope="col" className="w-20 py-4 text-sm font-semibold text-muted-foreground sm:w-32">Notes app</th>
                    <th scope="col" className="w-20 rounded-t-2xl bg-ink py-4 text-sm font-semibold text-ink-foreground sm:w-32">Wishy</th>
                  </tr>
                </thead>
                <tbody>
                  {compare.map((r, i) => (
                    <tr key={r.what}>
                      <th scope="row" className="border-t border-border py-5 pr-4 text-left font-semibold sm:text-lg">{r.what}</th>
                      <Mark yes={r.chat} />
                      <Mark yes={r.notes} />
                      <td className={cn('border-t border-ink/10 bg-brand/40 text-center dark:bg-brand/15', i === compare.length - 1 && 'rounded-b-2xl')}>
                        <CheckIcon aria-label="Yes" data-reveal style={{ '--i': i + 1 } as React.CSSProperties} className="mx-auto size-6 text-primary" />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            </div>
          </div>
        </section>
        </div>

        {/* Occasions, Rail: runs past the container's edge, swipe or scroll */}
        <section id="occasions" aria-labelledby="occasions-title" className="py-[clamp(4.5rem,10vw,9rem)]">
          <div data-reveal className={cn(wrap, 'grid gap-6 lg:grid-cols-12 lg:items-end lg:gap-8')}>
            <h2 id="occasions-title" className="max-w-[12ch] text-section font-bold tracking-[-0.035em] text-balance lg:col-span-6">One app for every occasion.</h2>
            <p className="max-w-[36ch] text-lead text-pretty text-muted-foreground lg:col-span-4 lg:col-start-9">Make a list for each one, and share each with the people it’s for.</p>
          </div>
          <ul aria-label="Occasions" tabIndex={0} className="mt-14 flex snap-x snap-mandatory scroll-px-4 gap-4 overflow-x-auto px-4 pb-2 outline-none [scrollbar-width:none] focus-visible:ring-3 focus-visible:ring-ring sm:scroll-px-8 sm:px-8 lg:scroll-px-[max(4rem,calc((100%-82rem)/2+4rem))] lg:px-[max(4rem,calc((100%-82rem)/2+4rem))]">
            {occasions.map((o, i) => (
              <li
                key={o.name}
                data-reveal
                style={{ '--i': i } as React.CSSProperties}
                className={cn('flex aspect-[4/5] w-[78%] max-w-[22rem] shrink-0 snap-start flex-col justify-end rounded-3xl p-7 transition-transform duration-200 ease-settle motion-safe:hover:-translate-y-1 sm:w-[22rem]', o.tint)}
              >
                <div>
                  <h3 className="text-display-s leading-none font-bold tracking-[-0.04em]">{o.name}</h3>
                  <p className="mt-4 max-w-[26ch] opacity-85">{o.body}</p>
                </div>
              </li>
            ))}
          </ul>
        </section>

        {/* FAQ, Rows: head on the left, the questions on the right */}
        <section id="faq" aria-labelledby="faq-title" className="border-t border-border py-[clamp(4.5rem,9vw,7.5rem)]">
          <div className={cn(wrap, 'grid gap-10 lg:grid-cols-12 lg:gap-8')}>
            <h2 id="faq-title" data-reveal className="text-section font-bold tracking-[-0.035em] text-balance lg:col-span-5">Your questions, answered.</h2>
            <div className="border-b border-border lg:col-span-7 lg:col-start-6">
              {faq.map((f, i) => (
                <details key={f.q} name="faq" data-reveal style={{ '--i': i } as React.CSSProperties} className="group border-t border-border">
                  <summary className="flex min-h-18 cursor-pointer list-none items-center justify-between gap-6 py-4 text-lg font-semibold outline-none hover:text-primary focus-visible:ring-3 focus-visible:ring-ring [&::-webkit-details-marker]:hidden">
                    {f.q}
                    <ChevronDownIcon aria-hidden className="size-5 shrink-0 text-muted-foreground transition-transform duration-200 ease-settle group-open:rotate-180" />
                  </summary>
                  <p className="faq__answer max-w-[60ch] pb-6 text-pretty text-muted-foreground">{f.a}</p>
                </details>
              ))}
            </div>
          </div>
        </section>

        {/* Closing band */}
        <section className="bg-ink py-[clamp(4.5rem,9vw,7.5rem)] text-ink-foreground">
          <div data-reveal className={cn(wrap, 'grid gap-8 lg:grid-cols-12 lg:items-end lg:gap-8')}>
            <h2 className="max-w-[12ch] text-display-s font-bold tracking-[-0.04em] text-balance lg:col-span-7">Start your first wishlist.</h2>
            <div className="lg:col-span-4 lg:col-start-9">
              <p className="text-lead text-pretty">It takes a minute. Your family will thank you in December.</p>
              <Link href="/login" className={cn(primary, 'mt-8 bg-brand text-brand-foreground hover:bg-ink-foreground')}>Create your first list</Link>
            </div>
          </div>
        </section>
      </main>

      {/* Footer, Mast: the wordmark large over the links */}
      <footer className="border-t border-border py-16">
        <div className={wrap}>
          <div className="flex flex-wrap items-end justify-between gap-10">
            <div>
              <p className="flex items-center gap-4 text-display-s leading-none font-bold tracking-[-0.04em]"><Logo className="size-14" /> Wishy</p>
              <p className="mt-4 max-w-[30ch] text-muted-foreground">Wishlists for families who would rather be surprised.</p>
            </div>
            <nav aria-label="Footer" className="grid grid-cols-2 gap-x-12 gap-y-1 text-muted-foreground">
              <a href="#how" className={navLink}>How it works</a>
              <a href="#features" className={navLink}>Features</a>
              <a href="#occasions" className={navLink}>Occasions</a>
              <a href="#faq" className={navLink}>FAQ</a>
              <Link href="/login" className={navLink}>Log in</Link>
            </nav>
          </div>
          <p className="mt-12 border-t border-border pt-6 text-sm text-muted-foreground">© {now.getFullYear()} Wishy</p>
        </div>
      </footer>
    </div>
  )
}

function Mark({ yes }: { yes: boolean }) {
  return (
    <td className="border-t border-border text-center">
      {yes
        ? <CheckIcon aria-label="Yes" className="mx-auto size-6 text-primary" />
        : <XIcon aria-label="No" className="mx-auto size-5 text-muted-foreground" />}
    </td>
  )
}

// What each step looks like in the app, built from the app's own cards. Decorative: the step's text carries the meaning.
function StepPicture({ step, countdown }: { step: number; countdown: string | null }) {
  const well = 'flex min-h-[28rem] flex-col justify-center gap-5 rounded-3xl bg-secondary p-6 sm:p-10'
  if (step === 0) return (
    <div className={well}>
      <p className="flex items-center gap-3 rounded-full bg-card px-5 py-3 text-muted-foreground ring-1 ring-field">
        <LinkIcon className="size-4 shrink-0" /> <span className="truncate">https://example-electronics.com/headphones</span>
      </p>
      <WishCard wish={headphones} className="mx-auto w-full max-w-72" />
    </div>
  )
  if (step === 1) return (
    <div className={well}>
      <div className="rounded-2xl bg-card p-6 ring-1 ring-border">
        <p className="text-lg font-semibold">Christmas 2026</p>
        <p className="text-sm text-muted-foreground">{['Shared with 3 people', countdown].filter(Boolean).join(', ')}</p>
        <ul className="mt-5 divide-y divide-border border-t border-border">
          {[['Mum', 'Can reserve'], ['Dad', 'Can reserve'], ['Grandma', 'Can view']].map(([name, role]) => (
            <li key={name} className="flex items-center gap-3 py-3">
              <Avatar name={name} className="size-10" />
              <span className="font-semibold">{name}</span>
              <span className="ml-auto rounded-full bg-secondary px-3 py-1 text-sm text-secondary-foreground">{role}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
  return (
    <div className={cn(well, 'grid items-start gap-4 sm:grid-cols-2')}>
      <div>
        <p className="mb-3 text-sm font-semibold text-muted-foreground">What you see</p>
        <WishCard wish={headphones} extra={<p className="mt-2 flex items-center gap-1.5 text-sm text-primary"><StarIcon className="size-3.5 fill-current" /> On your list</p>} />
      </div>
      <div>
        <p className="mb-3 text-sm font-semibold text-muted-foreground">What Mum sees</p>
        <GiftCard wish={headphones} state="taken" reserver="Dad" />
      </div>
    </div>
  )
}
