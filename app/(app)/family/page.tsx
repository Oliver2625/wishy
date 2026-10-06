import Link from 'next/link'
import { Avatar } from '@/components/wish-card'
import { getMember } from '@/lib/auth'
import { sharedWithMe } from '@/lib/lists'

export default async function FamilyPage() {
  const me = await getMember()
  if (!me) return null

  const lists = await sharedWithMe(me)
  const people = Map.groupBy(lists, (l) => l.owner_id)

  return (
    <main className="mx-auto w-full max-w-5xl px-4 py-8 sm:px-8 sm:py-12">
      <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">Family</h1>
      <p className="mt-2 text-muted-foreground">Lists people have shared with you.</p>

      <div className="mt-8 space-y-8">
        {[...people.values()].map((theirs) => (
          <section key={theirs[0].owner_id}>
            <h2 className="flex items-center gap-3 text-xl font-semibold">
              <Avatar name={theirs[0].name} className="size-10 bg-brand text-brand-foreground" /> {theirs[0].name}
            </h2>
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              {theirs.map((l) => (
                <Link key={l.id} href={`/family/${l.id}`} className="rounded-2xl border bg-card p-5 transition-[border-color,box-shadow,translate] duration-200 hover:border-ring hover:shadow-md hover:shadow-primary/5 motion-safe:hover:-translate-y-0.5">
                  <h3 className="text-lg font-semibold">{l.title}</h3>
                  <p className="text-muted-foreground">
                    {l.count} {l.count === 1 ? 'wish' : 'wishes'} · {l.count - l.reserved} still free
                  </p>
                </Link>
              ))}
            </div>
          </section>
        ))}
        {!lists.length && (
          <p className="rounded-2xl border border-dashed p-8 text-center text-muted-foreground">
            Nobody has shared a list with you yet.
          </p>
        )}
      </div>
    </main>
  )
}
