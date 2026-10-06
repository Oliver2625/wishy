'use client'

import { CopyIcon, UserMinusIcon } from 'lucide-react'
import { useActionState, useState, useTransition } from 'react'
import { toast } from 'sonner'
import type { Result } from '@/app/(app)/actions'
import { notify } from '@/components/notify'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription,
  AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue, SelectGroup, SelectLabel } from '@/components/ui/select'

export function CopyLink({ url }: { url: string }) {
  const copy = () => navigator.clipboard.writeText(url).then(
    () => toast.success('Link copied'),
    () => toast.error('Couldn’t copy. Select the link and copy it yourself.'),
  )
  return (
    <div className="flex flex-col gap-3 sm:flex-row">
      <Input readOnly value={url} aria-label="Share link" className="h-11 bg-secondary text-base" onFocus={(e) => e.currentTarget.select()} />
      <Button
        type="button"
        className="h-11 rounded-xl px-5 text-base"
        onClick={copy}
      >
        <CopyIcon /> Copy link
      </Button>
    </div>
  )
}

export function InviteForm({ action }: { action: (prev: Result, form: FormData) => Promise<Result> }) {
  // Success is a toast. Errors stay next to the field, where they're easier to fix.
  const [state, formAction, pending] = useActionState(async (prev: Result, form: FormData) => {
    const r = await action(prev, form)
    if (r?.message) toast.success(r.message)
    return r?.error ? r : null
  }, null)
  return (
    <form action={formAction}>
      <div className="flex flex-col gap-3 sm:flex-row">
        <Input name="email" type="email" required placeholder="name@example.com" aria-label="Email" className="h-11 text-base" />
        <Button type="submit" variant="outline" disabled={pending} className="h-11 rounded-xl px-5 text-base">Add person</Button>
      </div>
      {state?.error && <p role="alert" className="mt-2 text-sm text-destructive">{state.error}</p>}
    </form>
  )
}

// A form that saves as soon as any control inside it changes, and toasts the result.
export function AutoSaveForm({ save, ...props }: { save: (form: FormData) => Promise<Result> } & Omit<React.ComponentProps<'form'>, 'action'>) {
  return <form {...props} action={async (form) => notify(await save(form))} onChange={(e) => e.currentTarget.requestSubmit()} />
}

const ROLES = { reserve: 'Can reserve', view: 'Can view' }

// Saves as soon as a new access level is picked.
export function RoleSelect({ action, role, label }: { action: (form: FormData) => Promise<Result>; role: string; label: string }) {
  // Controlled: the page refreshes after saving, which would otherwise change defaultValue under Base UI.
  const [value, setValue] = useState(role)
  const [pending, start] = useTransition()
  const save = (next: string | null) => {
    if (!next) return
    setValue(next)
    const form = new FormData()
    form.set('role', next)
    start(async () => notify(await action(form)))
  }
  return (
    <Select value={value} items={ROLES} onValueChange={save} disabled={pending}>
      <SelectTrigger aria-label={label} className="h-11! min-w-36 bg-card text-base">
        <SelectValue />
      </SelectTrigger>
      <SelectContent align="end">
        <SelectGroup>
          <SelectLabel>Settings</SelectLabel>
          <SelectItem value="reserve">Can reserve</SelectItem>
          <SelectItem value="view">Can view</SelectItem>
        </SelectGroup>
      </SelectContent>
    </Select>
  )
}

export function RemoveAccess({ action, name }: { action: (form: FormData) => Promise<Result>; name: string }) {
  const [pending, start] = useTransition()
  const remove = () => {
    const form = new FormData()
    form.set('role', 'remove')
    start(async () => notify(await action(form)))
  }
  return (
    <AlertDialog>
      <AlertDialogTrigger render={<Button variant="ghost" size="icon-lg" aria-label={`Remove access for ${name}`} className="text-destructive" />}>
        <UserMinusIcon />
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Remove access for {name}?</AlertDialogTitle>
          <AlertDialogDescription>
            They won&apos;t see this list any more, and the share link changes so the old one stops working. Gifts they already reserved stay reserved.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Keep access</AlertDialogCancel>
          <AlertDialogAction variant="destructive" disabled={pending} onClick={remove}>
            {pending ? 'Removing…' : 'Remove access'}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
