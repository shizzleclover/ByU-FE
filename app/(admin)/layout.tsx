'use client'

import { useEffect } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { LayoutGrid, Users, Flag, Star, Upload, LogOut, ArrowLeft } from 'lucide-react'
import { Logo } from '@/components/icons/Logo'
import { cn } from '@/lib/utils'
import { useAuth } from '@/hooks/useAuth'
import { AdminMobileNav } from '@/components/layout/AdminMobileNav'

const ADMIN_NAV = [
  { href: '/admin', label: 'Overview', icon: LayoutGrid, exact: true },
  { href: '/admin/users', label: 'Users', icon: Users },
  { href: '/admin/users/import', label: 'Bulk Import', icon: Upload },
  { href: '/admin/reports', label: 'Reports', icon: Flag },
  { href: '/admin/featured', label: 'Featured', icon: Star },
]

function AdminSidebar() {
  const pathname = usePathname()
  const { user, signOut } = useAuth()

  const isActive = (href: string, exact?: boolean) =>
    exact ? pathname === href : pathname.startsWith(href)

  return (
    <aside className="hidden md:flex flex-col w-60 shrink-0 bg-ink border-r border-ink-soft h-full overflow-y-auto">
      <div className="px-5 pt-5 pb-4 border-b border-ink-soft flex items-center gap-3">
        <Logo size={28} href="/admin" className="text-bg" />
        <div>
          <p className="text-overline text-ink-faint">BYU CONNECT</p>
          <p className="text-[10px] font-bold tracking-widest text-state-warn uppercase">MANAGEMENT</p>
        </div>
      </div>

      <nav className="flex-1 px-3 py-4 flex flex-col gap-0.5">
        {ADMIN_NAV.map(({ href, label, icon: Icon, exact }) => {
          const active = isActive(href, exact)
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                'flex items-center gap-3 px-3 py-2.5 text-meta transition-colors relative rounded-md',
                active ? 'text-bg font-bold bg-ink-soft' : 'text-ink-faint hover:text-bg hover:bg-ink-soft/50',
              )}
            >
              {active && <span className="absolute left-0 top-1.5 bottom-1.5 w-1 bg-state-warn rounded-r-full" />}
              <Icon size={15} strokeWidth={1.5} />
              {label}
            </Link>
          )
        })}
      </nav>

      <div className="px-3 py-4 border-t border-ink-soft flex flex-col gap-0.5">
        {user && <p className="px-3 py-2 text-caption text-ink-faint truncate">{user.email}</p>}
        <Link
          href="/dashboard"
          className="flex items-center gap-3 px-3 py-2.5 text-meta text-ink-faint hover:text-bg transition-colors rounded-md hover:bg-ink-soft/50"
        >
          <ArrowLeft size={15} strokeWidth={1.5} />
          Exit to Dashboard
        </Link>
        <button
          onClick={signOut}
          className="flex items-center gap-3 px-3 py-2.5 text-meta text-state-error hover:text-state-error transition-colors w-full text-left rounded-md hover:bg-state-error/10"
        >
          <LogOut size={15} strokeWidth={1.5} />
          Sign Out
        </button>
      </div>
    </aside>
  )
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isAdmin, isLoading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!isLoading) {
      if (!isAuthenticated) router.replace('/signin')
      else if (!isAdmin) router.replace('/dashboard')
    }
  }, [isAuthenticated, isAdmin, isLoading, router])

  if (isLoading) {
    return (
      <div className="min-h-screen bg-bg flex items-center justify-center">
        <div className="text-overline text-ink-muted animate-pulse">LOADING</div>
      </div>
    )
  }

  if (!isAuthenticated || !isAdmin) return null

  return (
    <div className="flex h-screen overflow-hidden bg-bg">
      <AdminSidebar />
      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto pb-16 md:pb-0" id="main-content">
        {children}
      </div>
      <AdminMobileNav />
    </div>
  )
}
