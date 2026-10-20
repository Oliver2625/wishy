'use server'

import { headers } from 'next/headers'
import { redirect } from 'next/navigation'
import { after } from 'next/server'
import { auth, isInvited } from '@/lib/auth'
import { sql } from '@/lib/db'

// At most CODES_PER_HOUR sign-in codes per email. Each code allows only a few guesses (Neon Auth),
// so this caps both inbox flooding and code guessing. A per-email lock serializes check and record:
// without it, parallel requests each count from their own snapshot and all pass.
const CODES_PER_HOUR = 5
async function allowCodeSend(email: string) {
  const [, rows] = await sql.transaction([
    sql`select pg_advisory_xact_lock(hashtext(${email}))`,
    sql`insert into otp_sends (email) select ${email}
        where (select count(*) from otp_sends where email = ${email} and sent_at > now() - interval '1 hour') < ${CODES_PER_HOUR}
        returning 1`,
  ])
  await sql`delete from otp_sends where sent_at < now() - interval '1 day'`
  return rows.length > 0
}

export type LoginState = { email?: string; error?: string } | null

export async function login(_: LoginState, form: FormData): Promise<LoginState> {
  const email = String(form.get('email') ?? '').trim().toLowerCase()
  const otp = form.get('intent') === 'resend' ? '' : String(form.get('otp') ?? '').trim()
  if (!email.includes('@')) return { error: 'Enter your email.' }

  if (!otp) {
    // Only invited emails get a code. Same response AND same timing either way (the send runs
    // after the response), so the invite list can't be probed.
    // The rate limit also runs in after(), so it can't change the timing either.
    if (await isInvited(email)) {
      const origin = (await headers()).get('origin') ?? ''
      after(async () => {
        if (!(await allowCodeSend(email))) return console.warn('Sign-in code limit reached:', email)
        // Plain fetch, not auth.emailOtp: vinext runs after() outside the action scope, where the SDK's cookies() call throws.
        const res = await fetch(`${process.env.NEON_AUTH_BASE_URL!.replace(/\/$/, '')}/email-otp/send-verification-otp`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Origin: origin },
          body: JSON.stringify({ email, type: 'sign-in' }),
        })
        if (!res.ok) console.error('Sign-in code not sent:', res.status, await res.text())
      })
    }
    return { email }
  }

  const { error } = await auth.signIn.emailOtp({ email, otp })
  if (error) return { email, error: 'Wrong or expired code.' }
  redirect('/lists')
}

export async function logout() {
  await auth.signOut()
  redirect('/login')
}
