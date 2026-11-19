import { ChevronLeftIcon, CopyIcon, EyeOffIcon, GiftIcon, LinkIcon, ListIcon, LockIcon, PlusIcon, UsersIcon } from 'lucide-react'
import { Logo } from '@/components/logo'
import { buttonVariants } from '@/components/ui/button'
import { Avatar, type CardWish, GiftCard, WishCard } from '@/components/wish-card'
import { cn } from '@/lib/utils'

// Sample wishes, same family as the preview window. url: null so titles render as plain text.
const wish = (title: string, store: string, price: number, priority: number, image: string, note: string | null = null): CardWish =>
  ({ title, store, url: null, price: String(price), currency: 'DKK', priority, note, image_url: `/landing/${image}.svg` })
const shirt = wish('Striped rugby shirt', 'Example store', 540, 3, 'shirt', 'Size: Medium. Other colours are fine too.')
const jacket = wish('Rain jacket, olive', 'Example outdoor shop', 1699, 3, 'jacket', 'Size: Medium')
const headphones = wish('Wireless headphones', 'Example electronics', 1299, 2, 'headphones')
const tote = wish('Navy tote bag', 'Example store', 349, 1, 'tote')

const big = 'h-11 px-5 text-base'
type Tab = 'lists' | 'family' | 'reserved'

// The landing page's phone: the app at its real phone width (390px), zoomed into a drawn phone (no maker's details).
// journey: every screen stacked in the one screen; the page picks the visible one with data-screen (globals.css).
// Without it, only the list. Decorative either way: the page's text carries the meaning.
export function LandingPhone({ countdown, journey = false }: { countdown: string | null; journey?: boolean }) {
  const when = countdown ? `, ${countdown}` : ''
  return (
    <div aria-hidden inert className="mx-auto w-[17rem] select-none [perspective:2200px] sm:w-[19rem] lg:w-[20rem]">
      <div className="phone-tilt relative transition-transform duration-700 ease-settle [transform:rotateY(-18deg)_rotateX(6deg)_rotateZ(4deg)]">
        {/* Side buttons: action and volume on the left, power on the right */}
        <span className="absolute top-[17%] -left-[3px] h-7 w-1 rounded-l-sm bg-device-edge" />
        <span className="absolute top-[24%] -left-[3px] h-12 w-1 rounded-l-sm bg-device-edge" />
        <span className="absolute top-[32%] -left-[3px] h-12 w-1 rounded-l-sm bg-device-edge" />
        <span className="absolute top-[27%] -right-[3px] h-18 w-1 rounded-r-sm bg-device-edge" />
        {/* Metal band (a lit edge), then the black bezel, then the screen */}
        <div className="rounded-[3.25rem] bg-linear-to-br from-device-shine via-device-edge to-device p-[3px] shadow-phone">
          <div className="rounded-[3.1rem] bg-device p-[9px]">
            {/* after: is the glass, a soft diagonal glare over the screen */}
            <div className="relative grid aspect-[9/19.5] overflow-hidden rounded-[2.55rem] bg-background *:col-start-1 *:row-start-1 after:pointer-events-none after:absolute after:inset-0 after:z-20 after:bg-linear-to-br after:from-device-shine/30 after:via-transparent after:via-40% after:to-transparent">
              <span className="absolute top-2.5 left-1/2 z-10 h-6 w-24 -translate-x-1/2 rounded-full bg-device" />
              <Screen name="hero" tab="lists" shown>
                <ListTop title="Christmas 2026" meta={`3 wishes, shared with 5 people${when}`} />
                {[shirt, jacket, headphones].map((w) => <WishCard key={w.title} wish={w}><span className={buttonVariants({ variant: 'secondary', className: big })}>Edit</span></WishCard>)}
              </Screen>
              {journey && <>
                <Screen name="save" tab="lists">
                  <Back>Christmas 2026</Back>
                  <p className="text-3xl font-bold tracking-tight">Add a wish</p>
                  <div>
                    <p className="mb-2 font-semibold">Link</p>
                    <p className="flex items-center gap-2 rounded-lg border border-field bg-card px-3 py-3 text-muted-foreground"><LinkIcon className="size-4 shrink-0" /><span className="truncate">example-electronics.com/headphones</span></p>
                    <p className="mt-2 text-sm text-primary">Name, price and photo filled in from the shop.</p>
                  </div>
                  <WishCard wish={headphones} />
                  <span className={buttonVariants({ className: cn(big, 'w-full') })}><PlusIcon /> Add to list</span>
                </Screen>
                <Screen name="share" tab="lists">
                  <Back>Christmas 2026</Back>
                  <p className="text-3xl font-bold tracking-tight">Share Christmas 2026</p>
                  <div className="rounded-2xl border bg-card p-5">
                    <p className="font-semibold">Share with a link</p>
                    <p className="mt-3 truncate rounded-lg bg-secondary px-3 py-3 text-muted-foreground">https://wishy.example/l/7f3a2c</p>
                    <span className={buttonVariants({ className: cn(big, 'mt-3 w-full') })}><CopyIcon /> Copy link</span>
                  </div>
                  <div className="rounded-2xl border bg-card p-5">
                    <p className="font-semibold">People with access, 3</p>
                    <ul className="mt-3 divide-y border-t">
                      {[['Mum', 'Can reserve'], ['Dad', 'Can reserve'], ['Grandma', 'Can view']].map(([n, r]) => (
                        <li key={n} className="flex items-center gap-3 py-3"><Avatar name={n} className="size-10" /><span className="font-semibold">{n}</span><span className="ml-auto rounded-lg border border-field px-3 py-1.5 text-sm">{r}</span></li>
                      ))}
                    </ul>
                  </div>
                </Screen>
                <Screen name="reserve" tab="family"><FamilyView when={when} /></Screen>
                <Screen name="surprise-owner" tab="lists">
                  <ListTop title="Christmas 2026" meta={`3 wishes, shared with 5 people${when}`} />
                  <p className="flex gap-2 rounded-xl bg-secondary px-4 py-3 text-sm"><EyeOffIcon className="mt-0.5 size-4 shrink-0" /> Reservations are hidden from you, so the surprise holds.</p>
                  {[shirt, headphones].map((w) => <WishCard key={w.title} wish={w}><span className={buttonVariants({ variant: 'secondary', className: big })}>Edit</span></WishCard>)}
                </Screen>
                <Screen name="surprise-family" tab="family"><FamilyView when={when} /></Screen>
                <Screen name="priorities" tab="lists">
                  <ListTop title="Christmas 2026" meta="3 wishes" />
                  <div className="flex gap-2">
                    {countdown && <span className="rounded-full bg-primary px-4 py-2 font-semibold text-primary-foreground">{countdown}</span>}
                    <span className="flex items-center gap-1.5 rounded-full bg-secondary px-4 py-2 font-semibold"><LockIcon className="size-4" /> Private</span>
                  </div>
                  <WishCard wish={shirt} />
                  <WishCard wish={headphones} extra={<p className="mt-2 text-sm font-semibold text-primary">Would love</p>} />
                  <WishCard wish={tote} extra={<p className="mt-2 text-sm font-semibold text-muted-foreground">Nice to have</p>} />
                </Screen>
                <Screen name="reserved" tab="reserved">
                  <p className="text-3xl font-bold tracking-tight">Reserved by me</p>
                  <p className="text-muted-foreground">2 gifts for 2 people</p>
                  {([['Anna', headphones], ['Dad', tote]] as const).map(([n, w]) => (
                    <div key={n} className="space-y-3">
                      <p className="flex items-center gap-3 text-xl font-bold"><Avatar name={n} className="size-9" /> {n}</p>
                      <GiftCard wish={w} state="mine"><span className={buttonVariants({ variant: 'outline', className: big })}>Unreserve</span></GiftCard>
                    </div>
                  ))}
                </Screen>
              </>}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

// One screen of the app: status bar room, the phone header with its tab, then the content.
function Screen({ name, tab, shown = false, children }: { name: string; tab: Tab; shown?: boolean; children: React.ReactNode }) {
  return (
    <div data-for={name} className={cn('phone-screen w-[390px] [zoom:0.636] sm:[zoom:0.718] lg:[zoom:0.759]', shown && 'is-default')}>
      <div className="h-11 bg-card" />
      <header className="flex h-16 items-center gap-3 border-b bg-card px-4">
        <Logo />
        <nav className="flex flex-1 justify-around">
          {([['lists', 'Lists', ListIcon], ['family', 'Family', UsersIcon], ['reserved', 'Reserved', GiftIcon]] as const).map(([key, label, Icon]) => (
            <span key={key} className={cn('flex min-w-16 flex-col items-center gap-0.5 rounded-lg px-2 py-1.5 text-xs font-medium text-muted-foreground', key === tab && 'bg-accent text-primary')}>
              <Icon className="size-6" /> {label}
            </span>
          ))}
        </nav>
        <Avatar name="Anna" background={false} className="size-11" />
      </header>
      <div className="space-y-4 px-4 py-6">{children}</div>
    </div>
  )
}

function ListTop({ title, meta }: { title: string; meta: string }) {
  return (
    <>
      <span className="rounded-full bg-brand px-3 py-1 text-sm font-semibold text-brand-foreground">Christmas</span>
      <p className="mt-3 text-4xl font-bold tracking-tight">{title}</p>
      <p className="text-muted-foreground">{meta}</p>
      <div className="flex gap-2">
        {['All', 'Most wanted', 'Under 300 kr.'].map((f, i) => (
          <span key={f} className={cn('rounded-lg border bg-card px-4 py-2 font-medium whitespace-nowrap', i === 0 && 'border-primary bg-primary text-primary-foreground')}>{f}</span>
        ))}
      </div>
    </>
  )
}

function Back({ children }: { children: React.ReactNode }) {
  return <p className="flex items-center gap-1 font-medium text-primary"><ChevronLeftIcon className="size-5" /> {children}</p>
}

// Anna's list as her family sees it: one gift taken by Dad, one reserved by you, one still free.
function FamilyView({ when }: { when: string }) {
  return (
    <>
      <div className="flex items-center gap-4">
        <Avatar name="Anna" className="size-14" />
        <div>
          <p className="text-muted-foreground">Anna’s list{when}</p>
          <p className="text-3xl font-bold tracking-tight">Christmas 2026</p>
        </div>
      </div>
      <p className="rounded-xl bg-secondary px-4 py-3 font-semibold">2 of 3 reserved</p>
      <GiftCard wish={jacket} state="free"><span className={buttonVariants({ variant: 'outline', className: big })}><GiftIcon /> Reserve</span></GiftCard>
      <GiftCard wish={shirt} state="taken" reserver="Dad" />
      <GiftCard wish={headphones} state="mine"><span className={buttonVariants({ variant: 'outline', className: big })}>Unreserve</span></GiftCard>
    </>
  )
}
