'use client'

import { MoonIcon, SunIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'

export function ThemeToggle({ className }: { className?: string }) {
  function toggle() {
    const dark = document.documentElement.classList.toggle('dark')
    try { localStorage.theme = dark ? 'dark' : 'light' } catch {}
  }

  // Icons switch via CSS, so server and client render the same markup.
  return (
    <Button variant="ghost" size="icon" onClick={toggle} aria-label="Toggle dark mode" className={className}>
      <SunIcon className="hidden dark:block" />
      <MoonIcon className="dark:hidden" />
    </Button>
  )
}
