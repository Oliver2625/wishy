import { ThemeToggle } from '@/components/theme-toggle'

export default function LoginLayout({ children }: LayoutProps<'/login'>) {
  return (
    <>
      <ThemeToggle className="fixed top-4 right-4" />
      {children}
    </>
  )
}
