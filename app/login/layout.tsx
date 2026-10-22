import type { Metadata } from 'next'
import { Suspense } from 'react'

// The page is a client component, so its title lives here.
export const metadata: Metadata = { title: 'Sign in' }

export default function LoginLayout({ children }: LayoutProps<'/login'>) {
  // The page reads ?next= with useSearchParams, which needs a Suspense boundary.
  return <Suspense>{children}</Suspense>
}
