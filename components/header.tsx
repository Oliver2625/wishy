'use client'

import { LogOutIcon, SettingsIcon, UserIcon } from 'lucide-react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { buttonVariants } from '@/components/ui/button'
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuGroup, DropdownMenuItem,
  DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { cn } from '@/lib/utils'
import { logout } from '@/app/login/actions'

const links = [
  { href: '/', label: 'My lists', active: (p: string) => p === '/' || p.startsWith('/lists') || p.startsWith('/wishes') },
  { href: '/family', label: 'Family', active: (p: string) => p.startsWith('/family') },
  { href: '/reserved', label: 'Reserved by me', active: (p: string) => p === '/reserved' },
]

export function Nav() {
  const path = usePathname()
  return (
    <nav className="flex gap-1">
      {links.map((l) => (
        <Link
          key={l.href}
          href={l.href}
          aria-current={l.active(path) ? 'page' : undefined}
          className="rounded-lg px-3 py-2 text-sm font-medium transition-colors hover:bg-accent aria-[current=page]:bg-accent aria-[current=page]:text-primary sm:px-4 sm:text-base"
        >
          {l.label}
        </Link>
      ))}
    </nav>
  )
}

export function UserMenu({ name, email }: { name: string; email: string }) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger aria-label="Account" className={cn(buttonVariants({ variant: 'outline', size: 'icon-lg' }), 'rounded-full')}>
        <UserIcon />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="min-w-48">
        <DropdownMenuGroup>
          <DropdownMenuLabel>
            <div className="text-sm text-foreground">{name}</div>
            <div className="font-normal">{email}</div>
          </DropdownMenuLabel>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuItem render={<Link href="/profile" />}>
          <SettingsIcon />
          Profile
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => logout()}>
          <LogOutIcon />
          Sign out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
