import { PlusIcon } from 'lucide-react'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { buttonVariants } from '@/components/ui/button'
import { Page } from '@/components/wishlist'
import { getMember } from '@/lib/auth'
import { sql } from '@/lib/db'

export default async function Home() {
  const me = await getMember()
  if (!me) return null // the layout shows sign-in / not-invited

  const [first] = await sql`select id from wishlists where owner_id = ${me.id} order by created_at limit 1`
  if (first) redirect(`/lists/${first.id}`)

  return (
    <Page me={me}>
      <div className="flex flex-col items-start gap-4 rounded-2xl border bg-card p-8">
        <h1 className="text-3xl font-bold tracking-tight">Make your first wishlist</h1>
        <p className="text-muted-foreground">Birthday, Christmas, or just things you&apos;d love. Add your wishes, then share the list with family.</p>
        <Link href="/lists/new" className={buttonVariants({ className: 'h-11 px-5 text-base' })}>
          <PlusIcon /> New list
        </Link>
      </div>
    </Page>
  )
}
