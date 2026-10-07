'use client'

import { GiftIcon } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useActionState, useState } from 'react'
import { type Result, saveList } from '@/app/(app)/actions'
import { notify } from '@/components/notify'
import { Button, buttonVariants } from '@/components/ui/button'
import { DatePicker } from '@/components/date-picker'
import { Field, FieldDescription, FieldError, FieldLabel } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { daysToGo, type Occasion, OCCASIONS } from '@/lib/occasions'

type Values = { title: string; occasion: Occasion; date: string; message: string; visibility: 'me' | 'family' }
const big = 'h-11 text-base'
const names = new Intl.ListFormat('en', { type: 'conjunction' })

export function ListForm({ family, list, wishCount = 0 }: {
  family: string[]
  list?: Omit<Values, 'visibility'> & { id: string }
  wishCount?: number
}) {
  const [v, setV] = useState<Values>({ title: '', occasion: 'birthday', date: '', message: '', visibility: 'me', ...list })
  const router = useRouter()
  const [state, formAction, saving] = useActionState(async (prev: Result, form: FormData) => {
    const r = await saveList(prev, form)
    if (r?.redirectTo) { notify(r); router.push(r.redirectTo) }
    return r
  }, null)
  const set = (k: 'title' | 'message') => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => setV({ ...v, [k]: e.target.value })
  const back = list ? `/lists/${list.id}` : '/'
  const audience = list ? null : v.visibility === 'family' ? 'shared with family' : 'only you'

  return (
    <div className="mt-8 grid items-start gap-10 lg:grid-cols-[1fr_20rem]">
      <form action={formAction} className="space-y-6 rounded-2xl border bg-card p-6 sm:p-8">
        {list && <input type="hidden" name="id" value={list.id} />}

        <Field>
          <FieldLabel htmlFor="title">List name</FieldLabel>
          <Input id="title" name="title" required maxLength={100} placeholder="Birthday 2027" value={v.title} onChange={set('title')} className={big} />
        </Field>

        <fieldset>
          <legend className="mb-2 text-sm font-medium">Occasion</legend>
          <div className="flex flex-wrap gap-2">
            {(Object.entries(OCCASIONS) as [Occasion, string][]).map(([value, label]) => (
              <label key={value} className="cursor-pointer rounded-lg border px-5 py-2.5 font-medium transition-colors hover:bg-accent has-checked:border-primary has-checked:bg-primary has-checked:text-primary-foreground has-focus-visible:ring-3 has-focus-visible:ring-ring/50">
                <input type="radio" name="occasion" value={value} checked={v.occasion === value}
                  onChange={() => setV({ ...v, occasion: value })} className="sr-only" />
                {label}
              </label>
            ))}
          </div>
        </fieldset>

        <Field>
          <FieldLabel htmlFor="date">Date of the occasion <span className="font-normal text-muted-foreground">(optional)</span></FieldLabel>
          <input type="hidden" name="date" value={v.date} />
          <DatePicker id="date" value={v.date} onChange={(date) => setV({ ...v, date })} />
          <FieldDescription>Your family sees how many days are left to find a gift.</FieldDescription>
        </Field>

        <Field>
          <FieldLabel htmlFor="message">Message to your family <span className="font-normal text-muted-foreground">(optional)</span></FieldLabel>
          <Textarea id="message" name="message" maxLength={500} rows={3} placeholder="Shown at the top of the list" value={v.message} onChange={set('message')} className="text-base" />
        </Field>

        {!list && (
          <fieldset>
            <legend className="mb-2 text-sm font-medium">Who can see it?</legend>
            <div className="space-y-3">
              {([
                ['me', 'Only me for now', 'Keep it private while you fill it in. Share it when you are ready.', false],
                ['family', 'My family', family.length
                  ? `${names.format(family)} can see it and reserve gifts.`
                  : 'Nobody else is invited to Wishy yet.', !family.length],
              ] as const).map(([value, label, help, disabled]) => (
                <label key={value} className="flex cursor-pointer gap-3 rounded-xl border p-4 transition-colors has-checked:border-foreground has-checked:bg-secondary has-disabled:cursor-not-allowed has-disabled:opacity-60">
                  <input type="radio" name="visibility" value={value} checked={v.visibility === value} disabled={disabled}
                    onChange={() => setV({ ...v, visibility: value })} className="mt-1 size-5 shrink-0 accent-primary" />
                  <span>
                    <span className="block font-semibold">{label}</span>
                    <span className="text-sm text-muted-foreground">{help}</span>
                  </span>
                </label>
              ))}
            </div>
          </fieldset>
        )}

        <FieldError>{state?.error}</FieldError>
        <div className="flex items-center justify-end gap-3">
          <Link href={back} className={buttonVariants({ variant: 'ghost', className: big })}>Cancel</Link>
          <Button type="submit" disabled={saving} className={`${big} px-6`}>{list ? 'Save list' : 'Create list'}</Button>
        </div>
      </form>

      <aside>
        <h2 className="mb-3 text-sm font-semibold tracking-widest text-muted-foreground uppercase">How it will look</h2>
        <div className="overflow-hidden rounded-2xl border bg-card">
          <div className="bg-foreground p-6 text-background">
            <span className="rounded-full bg-brand px-3 py-1 text-sm font-semibold text-brand-foreground">{OCCASIONS[v.occasion]}</span>
            <h3 className="mt-4 text-3xl font-bold tracking-tight break-words">{v.title || 'Your list'}</h3>
            <p className="mt-2 opacity-80">
              {[`${wishCount} ${wishCount === 1 ? 'wish' : 'wishes'}`, audience, daysToGo(v.date || null)].filter(Boolean).join(' · ')}
            </p>
          </div>
          {v.message && <p className="border-b px-6 py-4 text-sm">&ldquo;{v.message}&rdquo;</p>}
          {!wishCount && (
            <div className="flex flex-col items-center gap-3 p-6 text-center">
              <span className="flex size-14 items-center justify-center rounded-full bg-muted"><GiftIcon className="size-6" /></span>
              <p className="font-semibold">No wishes yet</p>
              <p className="text-sm text-muted-foreground">After you create the list, add your first wish by pasting a link.</p>
            </div>
          )}
        </div>
      </aside>
    </div>
  )
}
