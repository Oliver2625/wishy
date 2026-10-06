'use server'

import { redirect } from 'next/navigation'
import { after } from 'next/server'
import { auth, isInvited } from '@/lib/auth'
import { sql } from '@/lib/db'

// At most CODES_PER_HOUR sign-in codes per email. Each code allows only a few guesses (Neon Auth),
// so this caps both inbox flooding and code guessing. Check and record happen in one statement.
const CODES_PER_HOUR = 5
async function allowCodeSend(email: string) {
  const rows = await sql`
    insert into otp_sends (email) select ${email}
    where (select count(*) from otp_sends where email = ${email} and sent_at > now() - interval '1 hour') < ${CODES_PER_HOUR}
    returning 1`
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
      after(async () => {
        if (!(await allowCodeSend(email))) return console.warn('Sign-in code limit reached:', email)
        const { error } = await auth.emailOtp.sendVerificationOtp({ email, type: 'sign-in' })
        if (error) console.error('Sign-in code not sent:', error.message)
      })
    }
    return { email }
  }

  const { error } = await auth.signIn.emailOtp({ email, otp })
  if (error) return { email, error: 'Wrong or expired code.' }
  redirect('/')
}

export async function logout() {
  await auth.signOut()
  redirect('/login')
}
