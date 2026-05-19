'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { LayoutGrid, Users, Flag, Star, Upload, LogOut, ArrowLeft, MoreHorizontal, X } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useAuth } from '@/hooks/useAuth'
import { LogoMark } from '@/components/icons/Logo'

const PINNED = [
  { href: '/admin', label: 'Overview', icon: LayoutGrid, exact: true },
  { href: '/admin/users', label: 'Users', icon: Users },
  { href: '/admin/reports', label: 'Reports', icon: Flag },
]

const DRAWER_ITEMS = [
  { href: '/admin', label: 'Overview', icon: LayoutGrid, exact: true },
  { href: '/admin/users', label: 'Users', icon: Users },
  { href: '/admin/users/import', label: 'Bulk Import', icon: Upload },
  { href: '/admin/reports', label: 'Reports', icon: Flag },
  { href: '/admin/featured', label: 'Featured', icon: Star },
]

export function AdminMobileNav() {
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
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-ink border-t border-ink-soft flex items-stretch h-16 safe-area-bottom shadow-lg">
        {PINNED.map(({ href, label, icon: Icon, exact }) => {
          const active = isActive(href, exact)
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                'flex-1 flex flex-col items-center justify-center gap-1 transition-colors',
                active ? 'text-bg' : 'text-ink-faint',
              )}
            >
              <Icon size={20} strokeWidth={active ? 2 : 1.5} />
              <span className="text-[9px] font-bold tracking-[0.08em] uppercase leading-none">
                {label}
              </span>
            </Link>
          )
        })}

        <button
          onClick={() => setOpen(true)}
          className={cn(
            'flex-1 flex flex-col items-center justify-center gap-1 transition-colors',
            open ? 'text-bg' : 'text-ink-faint',
          )}
        >
          <MoreHorizontal size={20} strokeWidth={1.5} />
          <span className="text-[9px] font-bold tracking-[0.08em] uppercase leading-none">More</span>
        </button>
      </nav>

      {open && (
        <div
          className="md:hidden fixed inset-0 z-40 bg-ink/40"
          onClick={() => setOpen(false)}
        />
      )}

      <div
        className={cn(
          'md:hidden fixed left-0 right-0 bottom-0 z-50 bg-ink border-t border-ink-soft shadow-2xl',
          'transition-transform duration-300 ease-out',
          open ? 'translate-y-0' : 'translate-y-full',
        )}
        style={{ maxHeight: '85dvh', overflowY: 'auto' }}
      >
        <div className="flex items-center justify-between px-5 py-4 border-b border-ink-soft sticky top-0 bg-ink">
          <div className="flex items-center gap-3">
            <div className="text-bg">
              <LogoMark size={24} />
            </div>
            {user && (
              <div>
                <p className="text-meta font-bold text-bg leading-none">@{user.username}</p>
                <p className="text-caption text-ink-faint leading-none mt-0.5 truncate max-w-[180px]">
                  {user.email}
                </p>
              </div>
            )}
          </div>
          <button
            onClick={() => setOpen(false)}
            className="text-ink-faint hover:text-bg transition-colors p-1"
          >
            <X size={20} />
          </button>
        </div>

        <div className="px-3 py-3 flex flex-col gap-0.5">
          {DRAWER_ITEMS.map(({ href, label, icon: Icon, exact }) => {
            const active = isActive(href, exact)
            return (
              <Link
                key={href}
                href={href}
                className={cn(
                  'flex items-center gap-3 px-3 py-3 text-meta transition-colors relative rounded-md',
                  active
                    ? 'text-bg font-bold bg-ink-soft'
                    : 'text-ink-faint hover:text-bg hover:bg-ink-soft/50',
                )}
              >
                {active && (
                  <span className="absolute left-0 top-2 bottom-2 w-1 bg-state-warn rounded-r-full" />
                )}
                <Icon size={16} strokeWidth={1.5} />
                {label}
              </Link>
            )
          })}
        </div>

        <div className="px-3 py-3 border-t border-ink-soft flex flex-col gap-0.5">
          <Link
            href="/dashboard"
            className="flex items-center gap-3 px-3 py-3 text-meta text-ink-faint hover:text-bg transition-colors rounded-md hover:bg-ink-soft/50"
          >
            <ArrowLeft size={16} strokeWidth={1.5} />
            Exit to Dashboard
          </Link>
          <button
            onClick={signOut}
            className="flex items-center gap-3 px-3 py-3 text-meta text-state-error hover:text-state-error transition-colors w-full text-left rounded-md hover:bg-state-error/10"
          >
            <LogOut size={16} strokeWidth={1.5} />
            Sign Out
          </button>
        </div>
        <div className="h-4" />
      </div>
    </>
  )
}
