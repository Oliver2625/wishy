import { notFound, redirect } from 'next/navigation'
import { getMember } from '@/lib/auth'
import { sql } from '@/lib/db'

// Share link: an invited member who opens it gets "can reserve" access. Non-members never get past the app's invite gate.
export default async function ShareLinkPage({ params }: PageProps<'/l/[code]'>) {
  const me = await getMember()
  if (!me) return null
  const { code } = await params
  const [list] = await sql`select id, owner_id from wishlists where share_code = ${code}`
  if (!list) notFound()
  if (list.owner_id !== me.id) {
    await sql`insert into list_shares (list_id, email) values (${list.id}, ${me.email.toLowerCase()}) on conflict do nothing`
  }
  redirect(`/family/${list.id}`)
}
