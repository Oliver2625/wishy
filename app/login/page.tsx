'use client'

import { RefreshCwIcon } from 'lucide-react'
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

const slots = '*:data-[slot=input-otp-slot]:h-12 *:data-[slot=input-otp-slot]:w-11 *:data-[slot=input-otp-slot]:text-xl'

export default function LoginPage() {
  const [state, action, pending] = useActionState(login, null)

  if (!state?.email) {
    return (
      <main className="flex flex-1 flex-col items-center justify-center gap-6 p-4">
        <Logo className="size-16" />
        <ViewTransition key="email" enter="slide-up" exit="fade-out" default="none">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Sign in to Wishy</CardTitle>
            <CardDescription>We&apos;ll email you a sign-in code.</CardDescription>
          </CardHeader>
          <form action={action}>
            <CardContent>
              <Field>
                <FieldLabel htmlFor="email">Email</FieldLabel>
                <Input id="email" name="email" type="email" required autoComplete="email" />
                <FieldError>{state?.error}</FieldError>
              </Field>
            </CardContent>
            <CardFooter className="mt-4">
              <Button type="submit" className="w-full" disabled={pending}>
                {pending && <Orb state="connecting" size={20} onInverse aria-hidden />} Send code
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
      <Card className="w-full max-w-[20rem]">
        <CardHeader>
          <CardTitle className='text-xl'>Verify your login</CardTitle>
          <CardDescription>
            Enter the verification code we sent to your email address: <span className="font-bold">{state.email}</span>.
          </CardDescription>
        </CardHeader>
        <form action={action}>
          <input type="hidden" name="email" value={state.email} />
          <CardContent>
            <Field>
              <div className="flex items-center justify-between">
                <FieldLabel htmlFor="otp">Verification code</FieldLabel>
                <Button type="submit" name="intent" value="resend" formNoValidate variant="outline" size="xs" disabled={pending}>
                  <RefreshCwIcon />
                  Resend Code
                </Button>
              </div>
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
          <CardFooter className="mt-4">
            <Button type="submit" className="w-full" disabled={pending}>
              {pending && <Orb state="connecting" size={20} onInverse aria-hidden />} Verify
            </Button>
          </CardFooter>
        </form>
      </Card>
      </ViewTransition>
    </main>
  )
}
