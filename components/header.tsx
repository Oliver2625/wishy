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

// short: the phone label, a single word so three fit beside the logo and avatar.
const links = [
  { href: '/lists', label: 'My lists', short: 'Lists', icon: ListIcon, active: (p: string) => p.startsWith('/lists') || p.startsWith('/wishes') },
  { href: '/family', label: 'Family', short: 'Family', icon: UsersIcon, active: (p: string) => p.startsWith('/family') },
  { href: '/reserved', label: 'Reserved by me', short: 'Reserved', icon: GiftIcon, active: (p: string) => p === '/reserved' },
]

// Phones: icon over a one-word label, like a tab bar. From sm up: icon + full label in a row.
export function Nav() {
  const path = usePathname()
  return (
    <nav aria-label="Main" className="flex flex-1 justify-around gap-1 sm:flex-none sm:justify-start">
      {links.map((l) => (
        <Link
          key={l.href}
          href={l.href}
          aria-current={l.active(path) ? 'page' : undefined}
          className="flex min-w-16 flex-col items-center gap-0.5 rounded-lg px-2 py-1.5 text-xs font-medium text-muted-foreground transition-colors hover:bg-accent aria-[current=page]:bg-accent aria-[current=page]:text-primary sm:flex-row sm:gap-2 sm:px-4 sm:py-2 sm:text-base sm:text-foreground"
        >
          <l.icon className="size-6 sm:size-5" />
          <span className="sm:hidden">{l.short}</span>
          <span className="hidden sm:inline">{l.label}</span>
        </Link>
      ))}
    </nav>
  )
}

export function UserMenu({ name, email }: { name: string; email: string }) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger aria-label="Account" className="rounded-full outline-none transition-transform focus-visible:ring-3 focus-visible:ring-ring/50 motion-safe:hover:scale-105">
        <Avatar name={name} background={false} className="size-12 cursor-pointer" />
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
