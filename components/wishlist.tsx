import { ChevronLeftIcon, PlusIcon } from 'lucide-react'
import Link from 'next/link'
import { Avatar } from '@/components/wish-card'
import { type Member, myLists, sharedWithMe } from '@/lib/lists'

export function Page({ me, activeId, children }: { me: Member; activeId?: string; children: React.ReactNode }) {
  return (
    <div className="mx-auto grid w-full max-w-7xl gap-10 px-4 py-8 sm:px-8 sm:py-12 lg:grid-cols-[16rem_1fr]">
      <Sidebar me={me} activeId={activeId} />
      <main className="min-w-0">{children}</main>
    </div>
  )
}

async function Sidebar({ me, activeId }: { me: Member; activeId?: string }) {
  const [mine, shared] = await Promise.all([myLists(me), sharedWithMe(me)])
  const item = 'flex items-center gap-3 rounded-xl px-4 py-3 transition-colors hover:bg-accent aria-[current=page]:bg-primary aria-[current=page]:font-semibold aria-[current=page]:text-primary-foreground'

  return (
    // Below the content on phones, so the list itself comes first.
    <aside className="order-last space-y-8 lg:order-0">
      <section>
        <h2 className="mb-3 text-sm font-semibold tracking-widest text-muted-foreground uppercase">My lists</h2>
        <ul className="space-y-1">
          {mine.map((l) => (
            <li key={l.id}>
              <Link href={`/lists/${l.id}`} aria-current={l.id === activeId ? 'page' : undefined} className={item}>
                <span className="truncate">{l.title}</span>
                <span className="ml-auto">{l.count}</span>
              </Link>
            </li>
          ))}
        </ul>
        <Link href="/lists/new" className="mt-2 flex w-full items-center gap-2 rounded-xl border border-dashed border-ring px-4 py-3 font-medium text-primary transition-colors hover:bg-accent">
          <PlusIcon className="size-5" /> New list
        </Link>
      </section>
      {shared.length > 0 && (
        <section>
          <h2 className="mb-3 text-sm font-semibold tracking-widest text-muted-foreground uppercase">Shared with me</h2>
          <ul className="space-y-1">
            {shared.map((l) => (
              <li key={l.id}>
                <Link href={`/family/${l.id}`} className={item}>
                  <Avatar name={l.name} />
                  <span className="truncate">{l.title}</span>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}
    </aside>
  )
}

export function BackLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link href={href} className="group -my-2.5 inline-flex items-center gap-1 py-2.5 font-medium text-primary hover:underline">
      <ChevronLeftIcon className="size-5 transition-transform motion-safe:group-hover:-translate-x-0.5" /> {children}
    </Link>
  )
}
