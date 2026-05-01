'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  User, LayoutGrid, Briefcase, FolderOpen, Link2,
  BookOpen, Phone, FileText, Bookmark, BarChart2,
  Settings, LogOut, Compass, MoreHorizontal, X,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useAuth } from '@/hooks/useAuth'
import { LogoMark } from '@/components/icons/Logo'

// Pinned to bottom bar (most used)
const PINNED = [
  { href: '/dashboard', label: 'Overview', icon: LayoutGrid, exact: true },
  { href: '/dashboard/profile', label: 'Profile', icon: User },
  { href: '/dashboard/projects', label: 'Projects', icon: FolderOpen },
  { href: '/discover', label: 'Discover', icon: Compass },
]

// All items in the drawer
const DRAWER_ITEMS = [
  { href: '/dashboard', label: 'Overview', icon: LayoutGrid, exact: true },
  { href: '/dashboard/profile', label: 'Profile', icon: User },
  { href: '/dashboard/canvas-layout', label: 'Canvas Layout', icon: LayoutGrid },
  { href: '/dashboard/services', label: 'Services', icon: Briefcase },
  { href: '/dashboard/projects', label: 'Projects', icon: FolderOpen },
  { href: '/dashboard/links', label: 'Links', icon: Link2 },
  { href: '/dashboard/stories', label: 'Stories', icon: BookOpen },
  { href: '/dashboard/contacts', label: 'Contacts', icon: Phone },
  { href: '/dashboard/resume', label: 'Resume', icon: FileText },
  { href: '/dashboard/saved', label: 'Saved', icon: Bookmark },
  { href: '/dashboard/analytics', label: 'Analytics', icon: BarChart2 },
  { href: '/discover', label: 'Discover', icon: Compass },
]

export function DashboardMobileNav() {
  const pathname = usePathname()
  const { user, signOut } = useAuth()
  const [open, setOpen] = useState(false)

  // Close drawer on route change
  useEffect(() => { setOpen(false) }, [pathname])

  // Lock scroll when drawer open
  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [open])

  const isActive = (href: string, exact?: boolean) =>
    exact ? pathname === href : pathname.startsWith(href)

  return (
    <>
      {/* Bottom tab bar */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-bg-elevated border-t border-line flex items-stretch h-16 safe-area-bottom">
        {PINNED.map(({ href, label, icon: Icon, exact }) => {
          const active = isActive(href, exact)
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                'flex-1 flex flex-col items-center justify-center gap-1 transition-colors',
                active ? 'text-ink' : 'text-ink-muted',
              )}
            >
              <Icon size={20} strokeWidth={active ? 2 : 1.5} />
              <span className="text-[9px] font-bold tracking-[0.08em] uppercase leading-none">
                {label}
              </span>
            </Link>
          )
        })}

        {/* More button */}
        <button
          onClick={() => setOpen(true)}
          className={cn(
            'flex-1 flex flex-col items-center justify-center gap-1 transition-colors',
            open ? 'text-ink' : 'text-ink-muted',
          )}
          aria-label="Open navigation menu"
        >
          <MoreHorizontal size={20} strokeWidth={1.5} />
          <span className="text-[9px] font-bold tracking-[0.08em] uppercase leading-none">More</span>
        </button>
      </nav>

      {/* Drawer backdrop */}
      {open && (
        <div
          className="md:hidden fixed inset-0 z-40 bg-ink/40"
          onClick={() => setOpen(false)}
        />
      )}

      {/* Drawer panel */}
      <div
        className={cn(
          'md:hidden fixed left-0 right-0 bottom-0 z-50 bg-bg-elevated border-t border-line',
          'transition-transform duration-300 ease-out',
          open ? 'translate-y-0' : 'translate-y-full',
        )}
        style={{ maxHeight: '85dvh', overflowY: 'auto' }}
      >
        {/* Drawer header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-line sticky top-0 bg-bg-elevated">
          <div className="flex items-center gap-3">
            <LogoMark size={24} />
            {user && (
              <div>
                <p className="text-meta font-bold text-ink leading-none">@{user.username}</p>
                <p className="text-caption text-ink-muted leading-none mt-0.5 truncate max-w-[180px]">
                  {user.email}
                </p>
              </div>
            )}
          </div>
          <button
            onClick={() => setOpen(false)}
            className="text-ink-muted hover:text-ink transition-colors p-1"
            aria-label="Close menu"
          >
            <X size={20} />
          </button>
        </div>

        {/* Nav items */}
        <div className="px-3 py-3 flex flex-col gap-0.5">
          {DRAWER_ITEMS.map(({ href, label, icon: Icon, exact }) => {
            const active = isActive(href, exact)
            return (
              <Link
                key={href}
                href={href}
                className={cn(
                  'flex items-center gap-3 px-3 py-3 text-meta transition-colors relative rounded-sm',
                  active
                    ? 'text-ink font-bold bg-bg-sunken'
                    : 'text-ink-soft hover:text-ink hover:bg-bg-sunken',
                )}
              >
                {active && (
                  <span className="absolute left-0 top-2 bottom-2 w-0.5 bg-ink rounded-full" />
                )}
                <Icon size={16} strokeWidth={1.5} />
                {label}
              </Link>
            )
          })}
        </div>

        {/* Bottom actions */}
        <div className="px-3 py-3 border-t border-line flex flex-col gap-0.5">
          <Link
            href="/dashboard/settings"
            className="flex items-center gap-3 px-3 py-3 text-meta text-ink-soft hover:text-ink transition-colors rounded-sm hover:bg-bg-sunken"
          >
            <Settings size={16} strokeWidth={1.5} />
            Settings
          </Link>
          <button
            onClick={signOut}
            className="flex items-center gap-3 px-3 py-3 text-meta text-ink-soft hover:text-ink transition-colors w-full text-left rounded-sm hover:bg-bg-sunken"
          >
            <LogOut size={16} strokeWidth={1.5} />
            Sign Out
          </button>
        </div>

        {/* Safe area spacer */}
        <div className="h-4" />
      </div>
    </>
  )
}
