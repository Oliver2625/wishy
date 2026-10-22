'use client'

import { useSearchParams } from 'next/navigation'
import { useActionState } from 'react'
import { ViewTransition } from '@/lib/view-transition'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Field, FieldError, FieldLabel } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { InputOTP, InputOTPGroup, InputOTPSeparator, InputOTPSlot } from '@/components/ui/input-otp'
import { Logo } from '@/components/logo'
import { Orb } from '@/components/orb'
import { login } from './actions'

const big = 'h-11 text-base'
const slots = '*:data-[slot=input-otp-slot]:h-12 *:data-[slot=input-otp-slot]:w-11 *:data-[slot=input-otp-slot]:text-xl'

export default function LoginPage() {
  const [state, action, pending] = useActionState(login, null)
  const next = useSearchParams().get('next') ?? ''

  if (!state?.email) {
    return (
      <main className="flex flex-1 flex-col items-center justify-center gap-6 p-4">
        <Logo className="size-16" />
        <ViewTransition key="email" enter="slide-up" exit="fade-out" default="none">
        <Card className="w-full max-w-sm">
          <CardHeader>
            <CardTitle className="text-xl font-semibold">Sign in to Wishy</CardTitle>
            <CardDescription>Get a sign-in code by email.</CardDescription>
          </CardHeader>
          <form action={action}>
            <CardContent>
              <Field>
                <FieldLabel htmlFor="email">Email</FieldLabel>
                <Input id="email" name="email" type="email" required autoComplete="email" placeholder="name@example.com" className={big} />
                <FieldError>{state?.error}</FieldError>
              </Field>
            </CardContent>
            <CardFooter className="mt-4">
              <Button type="submit" className={`${big} w-full`} disabled={pending}>
                {pending ? <><Orb state="connecting" size={20} onInverse aria-hidden /> Sending…</> : 'Send code'}
              </Button>
            </CardFooter>
          </form>
        </Card>
        </ViewTransition>
      </main>
    )
  }

  return (
    <main className="flex flex-1 flex-col items-center justify-center gap-6 p-4">
      <Logo className="size-16" />
      <ViewTransition key="code" enter="slide-up" exit="fade-out" default="none">
      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle className="text-xl font-semibold">Check your email</CardTitle>
          <CardDescription>
            If <span className="font-semibold text-foreground">{state.email}</span> is invited to Wishy, a 6-digit code is on its way.
            Nothing after a few minutes? Ask the person who invited you.
          </CardDescription>
        </CardHeader>
        <form action={action}>
          <input type="hidden" name="email" value={state.email} />
          <input type="hidden" name="next" value={next} />
          <CardContent>
            <Field>
              <FieldLabel htmlFor="otp">Sign-in code</FieldLabel>
              <InputOTP maxLength={6} id="otp" name="otp" required autoFocus aria-invalid={!!state.error} containerClassName="justify-center">
                <InputOTPGroup className={slots}>
                  <InputOTPSlot index={0} />
                  <InputOTPSlot index={1} />
                </InputOTPGroup>
                <InputOTPSeparator />
                <InputOTPGroup className={slots}>
                  <InputOTPSlot index={2} />
                  <InputOTPSlot index={3} />
                </InputOTPGroup>
                <InputOTPSeparator />
                <InputOTPGroup className={slots}>
                  <InputOTPSlot index={4} />
                  <InputOTPSlot index={5} />
                </InputOTPGroup>
              </InputOTP>
              <FieldError>{state.error}</FieldError>
            </Field>
          </CardContent>
          <CardFooter className="mt-4 flex-col gap-2">
            <Button type="submit" className={`${big} w-full`} disabled={pending}>
              {pending ? <><Orb state="connecting" size={20} onInverse aria-hidden /> Signing in…</> : 'Sign in'}
            </Button>
            <Button type="submit" name="intent" value="resend" formNoValidate variant="ghost" className={`${big} w-full`} disabled={pending}>
              Send a new code
            </Button>
          </CardFooter>
        </form>
      </Card>
      </ViewTransition>
    </main>
  )
}
