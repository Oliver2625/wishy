import { notFound } from 'next/navigation'
import { ListForm } from '@/components/list-form'
import { BackLink } from '@/components/wishlist'
import { getMember } from '@/lib/auth'
import { sql } from '@/lib/db'
import { getList } from '@/lib/lists'
import type { Occasion } from '@/lib/occasions'

export default async function EditListPage({ params }: PageProps<'/lists/[id]/edit'>) {
  const me = await getMember()
  if (!me) return null
  const { id } = await params
  const list = await getList(id, me)
  if (!list || list.role !== 'owner') notFound()
  const [{ count }] = await sql`select count(*)::int as count from wishes where wishlist_id = ${id}`

  return (
    <main className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-8 sm:py-12">
      <BackLink href={`/lists/${id}`}>Back to {list.title}</BackLink>
      <h1 className="mt-6 text-4xl font-bold tracking-tight sm:text-5xl">Edit list</h1>
      <p className="mt-2 text-muted-foreground">Who can see it is managed under Share.</p>
      <ListForm
        family={[]}
        wishCount={count}
        list={{ id, title: list.title, occasion: list.occasion as Occasion, date: list.event_date ?? '', message: list.message ?? '' }}
      />
    </main>
  )
}
