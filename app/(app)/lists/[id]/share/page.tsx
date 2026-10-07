import { headers } from 'next/headers'
import { notFound } from 'next/navigation'
import { setShareRole, shareList, updateSurprise } from '@/app/(app)/actions'
import { AutoSaveForm, CopyLink, InviteForm, RemoveAccess, RoleSelect } from '@/components/share-controls'
import { Avatar } from '@/components/wish-card'
import { BackLink } from '@/components/wishlist'
import { getMember } from '@/lib/auth'
import { sql } from '@/lib/db'
import { getList } from '@/lib/lists'

const card = 'rounded-2xl border bg-card p-6 sm:p-8'
const steps = [
  ['Your family opens the list', 'They see every wish, with price, link and your note.'],
  ['They reserve a gift', 'A reserved wish is marked as taken for everyone else.'],
  ['You stay surprised', 'Your own view of the list never shows what is reserved.'],
]

export default async function SharePage({ params }: PageProps<'/lists/[id]/share'>) {
  const me = await getMember()
  if (!me) return null
  const { id } = await params
  const list = await getList(id, me)
  if (!list || list.role !== 'owner') notFound()

  const h = await headers()
  const link = `${h.get('x-forwarded-proto') ?? 'http'}://${h.get('host')}/l/${list.share_code}`
  const people = await sql`
    select s.email, s.role, coalesce(nullif(u.name, ''), split_part(u.email, '@', 1)) as name
    from list_shares s left join neon_auth."user" u on lower(u.email) = s.email
    where s.list_id = ${id} order by coalesce(nullif(u.name, ''), s.email)`

  return (
    <main className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-8 sm:py-12">
      <BackLink href={`/lists/${id}`}>Back to {list.title}</BackLink>
      <h1 className="mt-6 text-4xl font-bold tracking-tight sm:text-5xl">Share {list.title}</h1>
      <p className="mt-2 text-muted-foreground">Choose who can see this list and reserve gifts from it.</p>

      <div className="mt-8 grid items-start gap-8 lg:grid-cols-[1fr_20rem]">
        <div className="space-y-6">
          <section className={card}>
            <h2 className="mb-4 text-lg font-semibold">Share with a link</h2>
            <CopyLink url={link} />
            <p className="mt-3 text-sm text-muted-foreground">
              Anyone in Wishy who opens the link gets access and can reserve. People outside Wishy need an invite from the admin first.
            </p>
          </section>

          <section className={card}>
            <h2 className="mb-4 text-lg font-semibold">Invite by email</h2>
            <InviteForm action={shareList.bind(null, id)} />
            <h3 className="mt-6 mb-2 text-sm font-semibold tracking-widest text-muted-foreground uppercase">
              People with access · {people.length}
            </h3>
            <ul className="divide-y border-t">
              {people.map((p) => (
                <li key={p.email} className="flex items-center gap-2 py-3 sm:gap-4">
                  {/* No avatar on phones: the name and email get the room and truncate behind the controls */}
                  <Avatar name={p.name ?? p.email} className="hidden size-11 sm:block" />
                  <div className="min-w-0 flex-1">
                    <div className="truncate font-semibold">{p.name ?? 'Not signed in yet'}</div>
                    <div className="truncate text-sm text-muted-foreground">{p.email}</div>
                  </div>
                  <RoleSelect action={setShareRole.bind(null, id, p.email)} role={p.role} label={`Access for ${p.email}`} />
                  <RemoveAccess action={setShareRole.bind(null, id, p.email)} name={p.name ?? p.email} />
                </li>
              ))}
              {!people.length && <li className="py-4 text-muted-foreground">Nobody yet.</li>}
            </ul>
          </section>

          <section className={card}>
            <h2 className="mb-4 text-lg font-semibold">Surprise settings</h2>
            <AutoSaveForm save={updateSurprise.bind(null, id)} className="space-y-5">
              {([
                ['hide', list.hide_reservations, 'Hide reservations from me', 'You won’t see which wishes are taken, or by whom.'],
                ['showReserver', list.show_reserver, 'Let family see who reserved what', 'Helps them avoid buying the same gift twice.'],
              ] as const).map(([name, checked, label, help]) => (
                <label key={name} className="flex gap-3">
                  <input type="checkbox" name={name} defaultChecked={checked} className="mt-1 size-5 shrink-0 accent-primary" />
                  <span>
                    <span className="block font-semibold">{label}</span>
                    <span className="text-sm text-muted-foreground">{help}</span>
                  </span>
                </label>
              ))}
            </AutoSaveForm>
          </section>
        </div>

        <aside className="rounded-2xl bg-foreground p-6 text-background sm:py-8 sm:px-10">
          <h2 className="text-2xl font-bold">How sharing works</h2>
          <ol className="mt-6 space-y-6">
            {steps.map(([title, body], i) => (
              <li key={title} className="flex gap-4">
                <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-brand font-semibold text-brand-foreground">{i + 1}</span>
                <span>
                  <span className="block font-semibold">{title}</span>
                  <span className="opacity-80">{body}</span>
                </span>
              </li>
            ))}
          </ol>
        </aside>
      </div>
    </main>
  )
}
