import Link from 'next/link'
import { redirect } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Nav, TabBar, UserMenu } from '@/components/header'
import { Logo } from '@/components/logo'
import { PageTransition } from '@/components/motion'
import { auth, getMember } from '@/lib/auth'
import { logout } from '../login/actions'

// Every page here is per-member: never let the framework's page cache store or serve one, even if a
// future change stops reading the session cookie (today that read alone keeps them uncached).
export const dynamic = 'force-dynamic'

export default async function AppLayout({ children }: LayoutProps<'/'>) {
  const member = await getMember()
  if (!member) {
    const { data: session } = await auth.getSession()
    if (!session) redirect('/login')
    return (
      <main className="flex flex-1 flex-col items-center justify-center gap-4 p-4 text-center">
        <h1 className="text-2xl font-semibold">This account isn&apos;t invited to Wishy</h1>
        <p className="max-w-md text-muted-foreground">
          Ask the person who runs your family&apos;s Wishy to invite {session.user.email}, then sign in again.
        </p>
        <form action={logout}><Button type="submit" variant="outline" className="h-11 px-5 text-base">Sign out</Button></form>
      </main>
    )
  }

  return (
    <>
      <header className="border-b bg-card">
        <div className="mx-auto flex h-18 max-w-7xl items-center gap-3 px-4 sm:gap-6 sm:px-8">
          <Link href="/" aria-label="Wishy, my lists" className="rounded-lg">
            <Logo />
          </Link>
          <Nav />
          <div className="ml-auto">
            <UserMenu name={member.name} email={member.email} />
          </div>
        </div>
      </header>
      <PageTransition>{children}</PageTransition>
      {/* Keeps the end of the page clear of the phone tab bar (h-16) */}
      <div aria-hidden className="h-16 shrink-0 sm:hidden" />
      <TabBar />
    </>
  )
}
