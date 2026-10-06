'use client'

import { useTransition } from 'react'
import { Button } from '@/components/ui/button'
import { notify } from '@/components/notify'
import type { Result } from '@/app/(app)/actions'

// A button that runs a (bound) server action and toasts its result. Disabled while it runs.
export function ActionButton({ action, ...props }: { action: () => Promise<Result> } & Omit<React.ComponentProps<typeof Button>, 'onClick' | 'action'>) {
  const [pending, start] = useTransition()
  return <Button type="button" disabled={pending} onClick={() => start(async () => notify(await action()))} {...props} />
}
