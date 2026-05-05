'use client'

import Link from 'next/link'
import { useQuery } from '@tanstack/react-query'
import { Users, Flag, Star, Upload } from 'lucide-react'
import { DashboardTopbar } from '@/components/layout/DashboardTopbar'
import { apiGet } from '@/lib/api'

interface AdminStats {
  totalUsers: number
  verifiedUsers: number
  suspendedUsers: number
  pendingReports: number
  totalProfiles: number
}

export default function AdminOverviewPage() {
  const { data: stats, isLoading } = useQuery({
    queryKey: ['admin', 'stats'],
    queryFn: () => apiGet<AdminStats>('/admin/stats'),
    staleTime: 30_000,
  })

  const statCards = [
    { label: 'TOTAL USERS', value: stats?.totalUsers, icon: Users, href: '/admin/users' },
    { label: 'VERIFIED STUDENTS', value: stats?.verifiedUsers, icon: Star, href: '/admin/users' },
    { label: 'PENDING REPORTS', value: stats?.pendingReports, icon: Flag, href: '/admin/reports', warn: (stats?.pendingReports ?? 0) > 0 },
    { label: 'SUSPENDED', value: stats?.suspendedUsers, icon: Users, href: '/admin/users' },
  ]

  const quickLinks = [
    { href: '/admin/users/import', label: 'Bulk Import Users', icon: Upload, desc: 'Upload Excel sheet to create accounts' },
    { href: '/admin/users', label: 'Manage Users', icon: Users, desc: 'Search, suspend, promote students' },
    { href: '/admin/reports', label: 'Review Reports', icon: Flag, desc: 'Moderate reported profiles', badge: stats?.pendingReports },
    { href: '/admin/featured', label: 'Featured Profiles', icon: Star, desc: 'Curate the landing page spotlight' },
  ]

  return (
    <>
      <DashboardTopbar title="Admin" />
      <div className="flex-1 px-6 md:px-8 py-10 space-y-10 overflow-auto">

        {/* Stats grid */}
        <div>
          <p className="text-overline text-ink-muted mb-4">PLATFORM OVERVIEW</p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-0 border-t border-l border-line">
            {statCards.map((card) => (
              <Link
                key={card.label}
                href={card.href}
                className="border-r border-b border-line p-5 hover:bg-bg-sunken transition-colors group"
              >
                <p className="text-overline text-ink-muted mb-2">{card.label}</p>
                {isLoading ? (
                  <div className="h-8 w-16 bg-bg-sunken animate-pulse" />
                ) : (
                  <p className={`text-h3 font-bold ${card.warn ? 'text-state-error' : 'text-ink'}`}>
                    {card.value ?? '—'}
                  </p>
                )}
              </Link>
            ))}
          </div>
        </div>

        {/* Quick actions */}
        <div>
          <p className="text-overline text-ink-muted mb-4">QUICK ACTIONS</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {quickLinks.map(({ href, label, icon: Icon, desc, badge }) => (
              <Link
                key={href}
                href={href}
                className="border border-line p-5 hover:bg-bg-sunken transition-colors flex items-start gap-4 group"
              >
                <div className="w-9 h-9 border border-line flex items-center justify-center shrink-0 group-hover:border-ink transition-colors">
                  <Icon size={16} strokeWidth={1.5} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-meta font-bold text-ink">{label}</p>
                    {badge != null && badge > 0 && (
                      <span className="text-overline bg-state-error text-white px-1.5 py-0.5 text-[10px]">
                        {badge}
                      </span>
                    )}
                  </div>
                  <p className="text-caption text-ink-muted mt-0.5">{desc}</p>
                </div>
                <span className="text-ink-faint group-hover:text-ink transition-colors">→</span>
              </Link>
            ))}
          </div>
        </div>

      </div>
    </>
  )
}
