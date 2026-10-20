import type { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { WishForm } from '@/components/wish-form'
import { BackLink } from '@/components/wishlist'
import { getMember } from '@/lib/auth'
import { sql } from '@/lib/db'
import { myLists } from '@/lib/lists'

export const metadata: Metadata = { title: 'Add a wish' }

export default async function NewWishPage({ searchParams }: PageProps<'/wishes/new'>) {
  const me = await getMember()
  if (!me) return null
  const { list } = await searchParams
  const [lists, [profile]] = await Promise.all([myLists(me), sql`select currency from profiles where user_id = ${me.id}`])
  if (!lists.length) redirect('/lists')
  const current = lists.find((l) => l.id === list) ?? lists[0]

  return (
    <main className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-8 sm:py-12">
      <BackLink href={`/lists/${current.id}`}>Back to {current.title}</BackLink>
      <h1 className="mt-6 text-4xl font-bold tracking-tight sm:text-5xl">Add a wish</h1>
      <WishForm lists={lists.map(({ id, title }) => ({ id, title }))} listId={current.id} currency={profile?.currency ?? 'DKK'} />
    </main>
  )
}
