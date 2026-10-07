'use client'

import { GiftIcon, ListIcon, LogOutIcon, SettingsIcon, UsersIcon } from 'lucide-react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Avatar } from '@/components/wish-card'
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuGroup, DropdownMenuItem,
  DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { logout } from '@/app/login/actions'

const links = [
  { href: '/', label: 'My lists', icon: ListIcon, active: (p: string) => p === '/' || p.startsWith('/lists') || p.startsWith('/wishes') },
  { href: '/family', label: 'Family', icon: UsersIcon, active: (p: string) => p.startsWith('/family') },
  { href: '/reserved', label: 'Reserved by me', icon: GiftIcon, active: (p: string) => p === '/reserved' },
]

// Icons only on phones (label stays for screen readers), icon + label from sm up.
export function Nav() {
  const path = usePathname()
  return (
    <nav className="flex gap-1">
      {links.map((l) => (
        <Link
          key={l.href}
          href={l.href}
          aria-current={l.active(path) ? 'page' : undefined}
          className="flex items-center gap-2 rounded-lg p-2.5 font-medium transition-colors hover:bg-accent aria-[current=page]:bg-accent aria-[current=page]:text-primary sm:px-4 sm:py-2"
        >
          <l.icon className="size-5" />
          <span className="sr-only sm:not-sr-only">{l.label}</span>
        </Link>
      ))}
    </nav>
  )
}

export function UserMenu({ name, email }: { name: string; email: string }) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger aria-label="Account" className="rounded-full outline-none transition-transform focus-visible:ring-3 focus-visible:ring-ring/50 motion-safe:hover:scale-105">
        <Avatar name={name} background={false} className="size-12" />
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
