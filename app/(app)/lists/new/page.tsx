import type { Metadata } from 'next'
import { ListForm } from '@/components/list-form'
import { BackLink } from '@/components/wishlist'
import { getMember } from '@/lib/auth'
import { family } from '@/lib/lists'

export const metadata: Metadata = { title: 'New list' }

export default async function NewListPage() {
  const me = await getMember()
  if (!me) return null
  const people = await family(me)

  return (
    <main className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-8 sm:py-12">
      <BackLink href="/">Back to my lists</BackLink>
      <h1 className="mt-6 text-4xl font-bold tracking-tight sm:text-5xl">Create a new list</h1>
      <p className="mt-2 text-muted-foreground">Give it a name now. You can add wishes and change everything else later.</p>
      <ListForm family={people.map((p) => p.name)} />
    </main>
  )
}
