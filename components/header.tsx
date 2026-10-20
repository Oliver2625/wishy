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

// short: the phone tab bar's label. Tab bars want single words (HIG tab-bars.md).
const links = [
  { href: '/lists', label: 'My lists', short: 'Lists', icon: ListIcon, active: (p: string) => p.startsWith('/lists') || p.startsWith('/wishes') },
  { href: '/family', label: 'Family', short: 'Family', icon: UsersIcon, active: (p: string) => p.startsWith('/family') },
  { href: '/reserved', label: 'Reserved by me', short: 'Reserved', icon: GiftIcon, active: (p: string) => p === '/reserved' },
]

// From sm up: icon + label in the header. Phones get TabBar instead.
export function Nav() {
  const path = usePathname()
  return (
    <nav aria-label="Main" className="hidden gap-1 sm:flex">
      {links.map((l) => (
        <Link
          key={l.href}
          href={l.href}
          aria-current={l.active(path) ? 'page' : undefined}
          className="flex items-center gap-2 rounded-lg px-4 py-2 font-medium transition-colors hover:bg-accent aria-[current=page]:bg-accent aria-[current=page]:text-primary"
        >
          <l.icon className="size-5" />
          {l.label}
        </Link>
      ))}
    </nav>
  )
}

// Phones: sections in a bar at the bottom, within thumb reach. Always visible, so people know where they are.
export function TabBar() {
  const path = usePathname()
  return (
    <nav aria-label="Main" className="fixed inset-x-0 bottom-0 z-40 grid grid-cols-3 border-t bg-card sm:hidden">
      {links.map((l) => (
        <Link
          key={l.href}
          href={l.href}
          aria-current={l.active(path) ? 'page' : undefined}
          className="flex h-16 flex-col items-center justify-center gap-1 text-xs font-medium text-muted-foreground aria-[current=page]:text-primary"
        >
          <l.icon className="size-6" />
          {l.short}
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
