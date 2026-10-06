import { notFound } from 'next/navigation'
import { WishForm } from '@/components/wish-form'
import { BackLink } from '@/components/wishlist'
import { getMember } from '@/lib/auth'
import { sql } from '@/lib/db'
import { myLists } from '@/lib/lists'

export default async function EditWishPage({ params }: PageProps<'/wishes/[id]/edit'>) {
  const me = await getMember()
  if (!me) return null
  const { id } = await params
  if (!/^[0-9a-f-]{36}$/i.test(id)) notFound()

  // Only the owner can edit; reservation fields are never sent to the form.
  const [[wish], lists] = await Promise.all([
    sql`select w.id, w.wishlist_id, w.title, w.store, w.url, w.price, w.priority, w.note, w.image_url, l.title as list_title
        from wishes w join wishlists l on l.id = w.wishlist_id
        where w.id = ${id} and l.owner_id = ${me.id}`,
    myLists(me),
  ])
  if (!wish) notFound()

  return (
    <main className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-8 sm:py-12">
      <BackLink href={`/lists/${wish.wishlist_id}`}>Back to {wish.list_title}</BackLink>
      <h1 className="mt-6 text-4xl font-bold tracking-tight sm:text-5xl">Edit wish</h1>
      <WishForm
        lists={lists.map(({ id, title }) => ({ id, title }))}
        listId={wish.wishlist_id}
        wish={{
          id: wish.id, title: wish.title, store: wish.store ?? '', url: wish.url ?? '', price: wish.price === null ? '' : String(Number(wish.price)),
          priority: wish.priority, note: wish.note ?? '', image_url: wish.image_url ?? '',
        }}
      />
    </main>
  )
}
