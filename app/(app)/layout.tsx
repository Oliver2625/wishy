import Link from 'next/link'
import { redirect } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Nav, UserMenu } from '@/components/header'
import { Logo } from '@/components/logo'
import { PageTransition } from '@/components/motion'
import { ThemeToggle } from '@/components/theme-toggle'
import { auth, getMember } from '@/lib/auth'
import { logout } from '../login/actions'

export default async function AppLayout({ children }: LayoutProps<'/'>) {
  const member = await getMember()
  if (!member) {
    if (!(await auth.getSession()).data) redirect('/login')
    return (
      <main className="flex flex-1 flex-col items-center justify-center gap-4 p-4">
        <h1 className="text-2xl font-semibold">This account isn&apos;t invited to Wishy.</h1>
        <form action={logout}><Button type="submit" variant="outline">Sign out</Button></form>
      </main>
    )
  }

  return (
    <>
      <header className="border-b bg-card">
        <div className="mx-auto flex h-18 max-w-7xl items-center gap-6 px-4 sm:px-8">
          <Link href="/" className="flex items-center gap-2.5 text-2xl font-bold tracking-tight">
            <Logo />
          </Link>
          <Nav />
          <div className="ml-auto flex items-center gap-2">
            <ThemeToggle />
            <UserMenu name={member.name} email={member.email} />
          </div>
        </div>
      </header>
      <PageTransition>{children}</PageTransition>
    </>
  )
}
