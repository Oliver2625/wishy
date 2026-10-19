import type { Metadata } from 'next'
import { logout } from '@/app/login/actions'
import { AppearancePicker, DeleteAccount, InviteDialog, ProfileForm } from '@/components/profile-controls'
import { Button } from '@/components/ui/button'
import { Avatar } from '@/components/wish-card'
import { getMember, isAdmin } from '@/lib/auth'
import { sql } from '@/lib/db'
import { family } from '@/lib/lists'

export const metadata: Metadata = { title: 'Profile' }

export default async function ProfilePage() {
  const me = await getMember()
  if (!me) return null

  const [[p], people] = await Promise.all([
    sql`select birthday::text as birthday, clothing_size, shoe_size, likes, avoid, currency from profiles where user_id = ${me.id}`,
    family(me),
  ])
  const admin = isAdmin(me.email)

  return (
    <main className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-8 sm:py-12">
      <div className="flex items-center gap-5">
        <Avatar name={me.name} className="size-16 sm:size-20" />
        <div className="min-w-0">
          <h1 className="truncate text-4xl font-bold tracking-tight sm:text-5xl">{me.name}</h1>
          <p className="mt-1 truncate text-muted-foreground">{me.email}</p>
        </div>
      </div>

      <div className="mt-8 grid items-start gap-8 lg:grid-cols-[1fr_20rem]">
        <ProfileForm profile={{
          name: me.name, email: me.email, birthday: p?.birthday ?? '',
          clothing: p?.clothing_size ?? '', shoe: p?.shoe_size ?? '', likes: p?.likes ?? '', avoid: p?.avoid ?? '', currency: p?.currency ?? 'DKK',
        }} />

        <aside className="space-y-6">
          <section className="rounded-2xl border bg-card p-6">
            <h2 className="text-lg font-semibold">My family</h2>
            <p className="text-sm text-muted-foreground">{people.length} {people.length === 1 ? 'person' : 'people'} on Wishy with you</p>
            <ul className="mt-4 space-y-3">
              {people.map((f) => (
                <li key={f.email} className="flex items-center gap-3 font-semibold">
                  <Avatar name={f.name} /> {f.name}
                </li>
              ))}
            </ul>
            {admin && <InviteDialog />}
          </section>

          <section className="rounded-2xl border bg-card p-6">
            <AppearancePicker />
          </section>

          <section className="space-y-3 rounded-2xl border bg-card p-6">
            <h2 className="text-lg font-semibold">Account</h2>
            <form action={logout}>
              <Button type="submit" variant="outline" className="h-11 w-full text-base">Sign out</Button>
            </form>
            {admin ? (
              <p className="text-sm text-muted-foreground">You&apos;re the admin, so this account can&apos;t be deleted here.</p>
            ) : (
              <>
                <DeleteAccount />
                <p className="text-sm text-muted-foreground">Deleting your account removes your lists and reservations for good.</p>
              </>
            )}
          </section>
        </aside>
      </div>
    </main>
  )
}
