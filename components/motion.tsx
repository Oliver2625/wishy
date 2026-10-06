'use client'

import { usePathname } from 'next/navigation'
import { ViewTransition } from '@/lib/view-transition'

// Animates route changes only: keyed by pathname, so filter (?f=) and refresh() updates don't slide the page.
export function PageTransition({ children }: { children: React.ReactNode }) {
  return (
    <ViewTransition key={usePathname()} enter="page-enter" exit="page-exit" default="none">
      {children}
    </ViewTransition>
  )
}
