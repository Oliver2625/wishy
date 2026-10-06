import 'server-only'
import { createNeonAuth } from '@neondatabase/auth/next/server'
import { cache } from 'react'
import { sql } from './db'

export const auth = createNeonAuth({
  baseUrl: process.env.NEON_AUTH_BASE_URL!,
  cookies: { secret: process.env.NEON_AUTH_COOKIE_SECRET! },
})

export const isInvited = async (email: string) =>
  (await sql`select 1 from invites where email = ${email.toLowerCase()}`).length > 0

// Only the admin may add new emails to the invite list. Unset env var = nobody (fails closed).
export const isAdmin = (email: string) =>
  !!process.env.WISHY_ADMIN_EMAIL && email.toLowerCase() === process.env.WISHY_ADMIN_EMAIL.toLowerCase()

// Signed in AND invited. Use this (not auth.getSession) before touching app data.
// cache(): layout, page and sidebar share one lookup per request.
export const getMember = cache(async () => {
  const { data: session } = await auth.getSession()
  const user = session?.user
  if (!user?.emailVerified) return null
  // Invite check + current name in one query. The session's name can be minutes stale after a profile edit.
  const [row] = await sql`
    select coalesce(nullif(name, ''), split_part(email, '@', 1)) as name
    from neon_auth."user" where id = ${user.id} and lower(email) in (select email from invites)`
  return row ? { ...user, name: row.name as string } : null
})
