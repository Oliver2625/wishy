'use client'

import { useRouter } from 'next/navigation'
import { useActionState, useState, useTransition } from 'react'
import { deleteAccount, inviteToWishy, type Result, saveProfile } from '@/app/(app)/actions'
import { DatePicker } from '@/components/date-picker'
import { notify } from '@/components/notify'
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription,
  AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Field, FieldDescription, FieldError, FieldLabel } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'

const big = 'h-11 text-base'
const card = 'space-y-5 rounded-2xl border bg-card p-6 sm:p-8'
const optional = <span className="font-normal text-muted-foreground">(optional)</span>

export type Profile = { name: string; email: string; birthday: string; clothing: string; shoe: string; likes: string; avoid: string }

// Toasts on success; errors stay next to the form.
function useSaving(action: (prev: Result, form: FormData) => Promise<Result>) {
  return useActionState(async (prev: Result, form: FormData) => {
    const r = await action(prev, form)
    if (r?.message) notify(r)
    return r?.error ? r : null
  }, null)
}

export function ProfileForm({ profile }: { profile: Profile }) {
  const [birthday, setBirthday] = useState(profile.birthday)
  const [state, formAction, saving] = useSaving(saveProfile)

  return (
    <form action={formAction} className="space-y-6">
      <section className={card}>
        <h2 className="text-lg font-semibold">Your details</h2>
        <Field>
          <FieldLabel htmlFor="name">Name</FieldLabel>
          <Input id="name" name="name" required maxLength={80} defaultValue={profile.name} autoComplete="name" className={big} />
        </Field>
        <Field>
          <FieldLabel htmlFor="email">Email</FieldLabel>
          <Input id="email" value={profile.email} readOnly disabled className={big} />
          <FieldDescription>You sign in with this. Ask the admin if it needs to change.</FieldDescription>
        </Field>
        <Field>
          <FieldLabel htmlFor="birthday">Birthday {optional}</FieldLabel>
          <input type="hidden" name="birthday" value={birthday} />
          <DatePicker id="birthday" value={birthday} onChange={setBirthday} past />
          <FieldDescription>Shown to your family on the lists you share.</FieldDescription>
        </Field>
      </section>

      <section className={card}>
        <div>
          <h2 className="text-lg font-semibold">Good to know for gift givers</h2>
          <p className="text-sm text-muted-foreground">Shown to family on every list you share. All optional.</p>
        </div>
        <div className="grid gap-5 sm:grid-cols-2">
          <Field>
            <FieldLabel htmlFor="clothing">Clothing size</FieldLabel>
            <Input id="clothing" name="clothing" maxLength={20} placeholder="For example: M" defaultValue={profile.clothing} className={big} />
          </Field>
          <Field>
            <FieldLabel htmlFor="shoe">Shoe size</FieldLabel>
            <Input id="shoe" name="shoe" maxLength={20} placeholder="For example: 42" defaultValue={profile.shoe} className={big} />
          </Field>
        </div>
        <Field>
          <FieldLabel htmlFor="likes">Things I like</FieldLabel>
          <Textarea id="likes" name="likes" maxLength={500} rows={3} placeholder="Colours, hobbies, favourite shops" defaultValue={profile.likes} className="text-base" />
        </Field>
        <Field>
          <FieldLabel htmlFor="avoid">Please avoid</FieldLabel>
          <Textarea id="avoid" name="avoid" maxLength={500} rows={3} placeholder="Allergies, things you already have" defaultValue={profile.avoid} className="text-base" />
        </Field>
      </section>

      <FieldError>{state?.error}</FieldError>
      <div className="flex justify-end">
        <Button type="submit" disabled={saving} className={`${big} rounded-xl px-6`}>{saving ? 'Saving…' : 'Save changes'}</Button>
      </div>
    </form>
  )
}

export function InviteDialog() {
  const [open, setOpen] = useState(false)
  const [state, formAction, pending] = useActionState(async (prev: Result, form: FormData) => {
    const r = await inviteToWishy(prev, form)
    if (r?.message) { notify(r); setOpen(false) }
    return r?.error ? r : null
  }, null)
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={<Button className={`${big} mt-5 w-full rounded-xl bg-brand text-brand-foreground hover:bg-brand/85`} />}>
        Invite someone
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Invite someone to Wishy</DialogTitle>
          <DialogDescription>They can sign in with this email. Share a list with them afterwards.</DialogDescription>
        </DialogHeader>
        <form action={formAction} className="grid gap-4">
          <Field>
            <FieldLabel htmlFor="invite-email">Email</FieldLabel>
            <Input id="invite-email" name="email" type="email" required placeholder="name@example.com" className={big} />
            <FieldError>{state?.error}</FieldError>
          </Field>
          <DialogFooter>
            <Button type="submit" disabled={pending}>{pending ? 'Inviting…' : 'Invite'}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

export function DeleteAccount() {
  const router = useRouter()
  const [pending, start] = useTransition()
  const remove = () => start(async () => {
    const r = await deleteAccount()
    notify(r)
    if (r?.redirectTo) router.push(r.redirectTo)
  })
  return (
    <AlertDialog>
      <AlertDialogTrigger render={<Button variant="outline" className={`${big} w-full rounded-xl border-destructive/40 text-destructive hover:bg-destructive/10 hover:text-destructive`} />}>
        Delete account
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete your account?</AlertDialogTitle>
          <AlertDialogDescription>
            Your lists and wishes are deleted, gifts you reserved are released, and you&apos;re removed from Wishy.
            You&apos;ll need a new invite to come back. This can&apos;t be undone.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Keep my account</AlertDialogCancel>
          <AlertDialogAction variant="destructive" disabled={pending} onClick={remove}>
            {pending ? 'Deleting…' : 'Delete account'}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
