import { ViewTransition } from '@/lib/view-transition'
import { Orb } from '@/components/orb'

// Shown while a page in the app loads (Next.js loading convention).
export default function Loading() {
  return (
    <ViewTransition exit="fade-out" default="none">
      <div className="flex flex-1 items-center justify-center py-24">
        <Orb state="working" size={64} aria-label="Loading" />
      </div>
    </ViewTransition>
  )
}
