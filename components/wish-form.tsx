'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useActionState, useState, useTransition } from 'react'
import { deleteWish, fetchDetails, type Result, saveWish } from '@/app/(app)/actions'
import { toast } from 'sonner'
import { notify } from '@/components/notify'
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription,
  AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import { Button, buttonVariants } from '@/components/ui/button'
import { Field, FieldError, FieldLabel } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { Orb } from '@/components/orb'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { type CardWish, WishCard } from '@/components/wish-card'
import { parsePrice } from '@/lib/parse'

type Values = { title: string; store: string; url: string; price: string; priority: number; note: string; image_url: string }
const empty: Values = { title: '', store: '', url: '', price: '', priority: 2, note: '', image_url: '' }
const priorities = [[1, 'Nice to have'], [2, 'Would love'], [3, 'Most wanted']] as const
const big = 'h-11 text-base'

// currency: what the price is saved in. Your profile's for a new wish, the wish's own when editing.
export function WishForm({ lists, listId, currency, wish }: {
  lists: { id: string; title: string }[]
  listId: string
  currency: string
  wish?: Partial<Values> & { id: string }
}) {
  const [v, setV] = useState<Values>({ ...empty, ...wish })
  const router = useRouter()
  const [state, formAction, saving] = useActionState(async (prev: Result, form: FormData) => {
    const r = await saveWish(prev, form)
    if (r?.redirectTo) { notify(r); router.push(r.redirectTo) }
    return r
  }, null)
  const [fetching, startFetch] = useTransition()
  const [fetchError, setFetchError] = useState<string>()
  const set = (k: keyof Values) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => setV({ ...v, [k]: e.target.value })

  const fetchFromLink = () => startFetch(async () => {
    setFetchError(undefined)
    const r = await fetchDetails(v.url, currency)
    if ('error' in r) return setFetchError(r.error)
    setV((cur) => ({
      ...cur,
      title: r.title || cur.title, store: r.store || cur.store,
      price: r.price || cur.price, image_url: r.imageUrl || cur.image_url,
    }))
    if (r.priceNote) toast.info(r.priceNote)
    if (r.title || r.price || r.imageUrl) toast.success('Filled in from the link. Check it looks right.')
    else toast.warning('That page didn’t say much. Type the details in below.')
  })

  const price = parsePrice(v.price)
  const preview: CardWish = { ...v, currency, url: null, price: price === null || Number.isNaN(price) ? null : String(price), note: v.note || null, image_url: v.image_url || null, store: v.store || null }

  return (
    <div className="mt-8 grid items-start gap-10 lg:grid-cols-[1fr_20rem]">
      <form action={formAction} className="space-y-6 rounded-2xl border bg-card p-6 sm:p-8">
        {wish && <input type="hidden" name="id" value={wish.id} />}
        <input type="hidden" name="imageUrl" value={v.image_url} />
        <input type="hidden" name="currency" value={currency} />

        <div className="rounded-xl bg-secondary p-5">
          <FieldLabel htmlFor="url">Paste a link</FieldLabel>
          <div className="mt-2 flex flex-col gap-3 sm:flex-row">
            <Input id="url" name="url" type="url" placeholder="https://…" value={v.url} onChange={set('url')} className={`${big} bg-card`} />
            <Button type="button" onClick={fetchFromLink} disabled={!/^https?:\/\/./.test(v.url) || fetching}
              className={`${big} bg-foreground px-5 text-background hover:bg-foreground/85`}>
              {fetching ? <><Orb state="searching" size={20} onInverse aria-hidden /> Fetching…</> : 'Fetch details'}
            </Button>
          </div>
          <p className="mt-2 text-sm text-muted-foreground">Wishy fills in the name, price and photo for you. Or type them in below.</p>
          <FieldError>{fetchError}</FieldError>
        </div>

        <Field>
          <FieldLabel htmlFor="title">What do you wish for?</FieldLabel>
          <Input id="title" name="title" required maxLength={200} value={v.title} onChange={set('title')} className={big} />
        </Field>

        <div className="grid gap-6 sm:grid-cols-[1fr_1.5fr]">
          <Field>
            <FieldLabel htmlFor="price">Price <span className="font-normal text-muted-foreground">({currency})</span></FieldLabel>
            <Input id="price" name="price" inputMode="decimal" placeholder="649" value={v.price} onChange={set('price')} className={big} />
          </Field>
          <Field>
            <FieldLabel htmlFor="store">Where to buy it</FieldLabel>
            <Input id="store" name="store" maxLength={100} value={v.store} onChange={set('store')} className={big} />
          </Field>
        </div>

        <Field>
          <FieldLabel htmlFor="list">Save to list</FieldLabel>
          <Select name="listId" defaultValue={listId} items={Object.fromEntries(lists.map((l) => [l.id, l.title]))}>
            <SelectTrigger id="list" className="h-11! w-full bg-card text-base">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {lists.map((l) => <SelectItem key={l.id} value={l.id}>{l.title}</SelectItem>)}
            </SelectContent>
          </Select>
        </Field>

        <fieldset>
          <legend className="mb-2 text-sm font-medium">How much do you want it?</legend>
          <div className="flex flex-wrap gap-2">
            {priorities.map(([value, label]) => (
              <label key={value} className="cursor-pointer rounded-lg border px-5 py-2.5 font-medium transition-colors hover:bg-accent has-checked:border-primary has-checked:bg-primary has-checked:text-primary-foreground has-focus-visible:ring-3 has-focus-visible:ring-ring/50">
                <input type="radio" name="priority" value={value} checked={v.priority === value}
                  onChange={() => setV({ ...v, priority: value })} className="sr-only" />
                {label}
              </label>
            ))}
          </div>
        </fieldset>

        <Field>
          <FieldLabel htmlFor="note">Note for your family <span className="font-normal text-muted-foreground">(optional)</span></FieldLabel>
          <Textarea id="note" name="note" maxLength={500} rows={3} value={v.note} onChange={set('note')} className="text-base" />
        </Field>

        <FieldError>{state?.error}</FieldError>
        <div className="flex flex-wrap items-center justify-end gap-3">
          {wish && <DeleteWish id={wish.id} title={v.title} />}
          <Link href={`/lists/${listId}`} className={buttonVariants({ variant: 'ghost', className: big })}>Cancel</Link>
          <Button type="submit" disabled={saving} className={`${big} px-6`}>Save wish</Button>
        </div>
      </form>

      <aside>
        <h2 className="mb-3 text-sm font-semibold tracking-widest text-muted-foreground uppercase">How it will look</h2>
        <WishCard wish={preview} />
        <p className="mt-3 text-sm text-muted-foreground">The preview updates while you type.</p>
      </aside>
    </div>
  )
}

function DeleteWish({ id, title }: { id: string; title: string }) {
  const router = useRouter()
  const [deleting, startDelete] = useTransition()
  return (
    <AlertDialog>
      <AlertDialogTrigger type="button" className={buttonVariants({ variant: 'ghost', className: `${big} mr-auto text-destructive` })}>
        Delete
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete this wish?</AlertDialogTitle>
          <AlertDialogDescription>
            {title ? <>&ldquo;{title}&rdquo; will be removed</> : 'It will be removed'} from your list, including any reservation on it. This can&apos;t be undone.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel type="button">Keep it</AlertDialogCancel>
          <AlertDialogAction type="button" variant="destructive" disabled={deleting} onClick={() => startDelete(async () => {
            const r = await deleteWish(id)
            notify(r)
            if (r?.redirectTo) router.push(r.redirectTo)
          })}>
            {deleting ? 'Deleting…' : 'Delete wish'}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
