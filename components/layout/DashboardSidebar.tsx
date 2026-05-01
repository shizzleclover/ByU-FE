'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  User, LayoutGrid, Briefcase, FolderOpen, Link2,
  BookOpen, Phone, FileText, Bookmark, BarChart2,
  Settings, LogOut, Compass, BadgeCheck,
} from 'lucide-react'
import { useQuery } from '@tanstack/react-query'
import { Logo } from '@/components/icons/Logo'
import { cn } from '@/lib/utils'
import { useAuth } from '@/hooks/useAuth'
import { apiGet } from '@/lib/api'
import type { Profile } from '@/types/api'

const NAV_ITEMS = [
  { href: '/discover', label: 'Discover', icon: Compass },
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
  { href: '/dashboard/settings/verification', label: 'Get Verified', icon: BadgeCheck },
]

export function DashboardSidebar() {
  const pathname = usePathname()
  const { user, signOut } = useAuth()

  const { data: profile } = useQuery({
    queryKey: ['profile', 'me'],
    queryFn: () => apiGet<Profile>('/profile/me'),
    staleTime: 60_000,
  })

  const score = profile?.completenessScore ?? 0

  const isActive = (href: string, exact?: boolean) =>
    exact ? pathname === href : pathname.startsWith(href)

  return (
    <aside className="hidden md:flex flex-col w-60 shrink-0 bg-bg-elevated border-r border-line h-screen sticky top-0 overflow-y-auto">
      {/* Header */}
      <div className="px-5 pt-5 pb-4 border-b border-line flex items-center gap-3">
        <Logo size={32} href="/" />
        <span className="text-overline text-ink-muted">BYU CONNECT</span>
      </div>

      {/* Profile mini + completeness */}
      {user && (
        <div className="px-5 py-4 border-b border-line">
          <p className="text-meta font-bold text-ink truncate">@{user.username}</p>
          <p className="text-caption text-ink-muted truncate">{user.email}</p>
          {score < 100 && (
            <Link href="/dashboard/profile" className="group block mt-3">
              <div className="flex items-center justify-between mb-1">
                <span className="text-[10px] font-bold tracking-[0.08em] text-ink-muted uppercase">Canvas</span>
                <span className="text-[10px] font-bold text-ink-muted">{score}%</span>
              </div>
              <div className="h-1 bg-bg-sunken w-full">
                <div
                  className="h-full bg-ink transition-all duration-500"
                  style={{ width: `${score}%` }}
                />
              </div>
            </Link>
          )}
          {score === 100 && (
            <p className="text-[10px] font-bold tracking-[0.08em] text-state-success uppercase mt-2">
              ✓ Canvas complete
            </p>
          )}
        </div>
      )}

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 flex flex-col gap-0.5">
        {NAV_ITEMS.map(({ href, label, icon: Icon, exact }) => {
          const isVerifyLink = href === '/dashboard/settings/verification'
          const active = isActive(href, exact)
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                'flex items-center gap-3 px-3 py-2.5 text-meta transition-colors relative',
                active
                  ? 'text-ink font-bold bg-bg-sunken'
                  : isVerifyLink
                  ? 'text-blue-500 hover:bg-blue-50/50'
                  : 'text-ink-soft hover:text-ink hover:bg-bg-sunken',
              )}
            >
              {active && (
                <span className="absolute left-0 top-1 bottom-1 w-0.5 bg-ink" />
              )}
              <Icon size={15} strokeWidth={1.5} />
              {label}
            </Link>
          )
        })}
      </nav>

      {/* Bottom */}
      <div className="px-3 py-4 border-t border-line flex flex-col gap-0.5">
        <Link
          href="/dashboard/settings"
          className="flex items-center gap-3 px-3 py-2.5 text-meta text-ink-soft hover:text-ink transition-colors"
        >
          <Settings size={15} strokeWidth={1.5} />
          Settings
        </Link>
        <button
          onClick={signOut}
          className="flex items-center gap-3 px-3 py-2.5 text-meta text-ink-soft hover:text-ink transition-colors w-full text-left"
        >
          <LogOut size={15} strokeWidth={1.5} />
          Sign Out
        </button>
      </div>
    </aside>
  )
}
