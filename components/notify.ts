import { toast } from 'sonner'
import type { Result } from '@/app/(app)/actions'

// One place that turns a server action's result into a toast.
export function notify(r: Result) {
  if (r?.error) toast.error(r.error)
  else if (r?.message) toast.success(r.message)
}
