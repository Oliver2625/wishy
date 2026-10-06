import { auth } from '@/lib/auth'

// Redirects signed-out visitors. The invite check happens in getMember().
export default auth.middleware({ loginUrl: '/login' })

export const config = {
  // Everything except sign-in, Next internals and files with an extension (icon.svg, ...).
  matcher: ['/((?!login|_next|.*\\..*).*)'],
}
