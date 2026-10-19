import { toast } from 'sonner'
import type { Result } from '@/app/(app)/actions'

// One place that turns a server action's result into a toast.
// Errors stay until dismissed, so nobody misses one that timed out.
export function notify(r: Result) {
  if (r?.error) toast.error(r.error, { duration: Infinity, closeButton: true })
  else if (r?.message) toast.success(r.message)
}
