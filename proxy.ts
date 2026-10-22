import type { NextRequest } from 'next/server'
import { auth } from '@/lib/auth'

// Redirects signed-out visitors. The invite check happens in getMember().
// ?next= remembers where they were going, so a share link (/l/<code>) still opens after sign-in.
export default function proxy(request: NextRequest) {
  return auth.middleware({ loginUrl: `/login?next=${encodeURIComponent(request.nextUrl.pathname)}` })(request)
}

export const config = {
  // Everything except the landing page (/), sign-in, Next internals and files with an extension (icon.svg, ...).
  matcher: ['/((?!login|_next|.*\\..*).+)'],
}
