'use client'

import Link from 'next/link'
import { useQuery } from '@tanstack/react-query'
import { DashboardTopbar } from '@/components/layout/DashboardTopbar'
import { Hairline } from '@/components/editorial/Hairline'
import { apiGet } from '@/lib/api'
import { useAuth } from '@/hooks/useAuth'
import type { AnalyticsOverview, Profile } from '@/types/api'

const COMPLETENESS_ITEMS = [
  { key: 'avatarUrl', label: 'Add a profile photo', href: '/dashboard/profile' },
  { key: 'bio', label: 'Write your bio', href: '/dashboard/profile' },
  { key: 'services', label: 'Add a service', href: '/dashboard/services' },
  { key: 'projects', label: 'Add a project', href: '/dashboard/projects' },
  { key: 'contacts', label: 'Add a contact method', href: '/dashboard/contacts' },
]

export default function DashboardPage() {
  const { user } = useAuth()

  const { data: analytics } = useQuery({
    queryKey: ['analytics', 'overview'],
    queryFn: () => apiGet<AnalyticsOverview>('/analytics/overview'),
    staleTime: 60_000,
  })

  const { data: profile } = useQuery({
    queryKey: ['profile', 'me'],
    queryFn: () => apiGet<Profile>('/profile/me'),
    staleTime: 60_000,
  })

  const hour = new Date().getHours()
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening'
  const firstName = user?.username ?? ''

  return (
    <>
      <DashboardTopbar title="Overview" />
      <div className="flex-1 px-6 md:px-8 py-10 space-y-10 overflow-auto">
        {/* Greeting */}
        <div>
          <h2 className="text-h3 font-bold text-ink">
            {greeting}, {firstName}.
          </h2>
          {profile && (
            <p className="text-caption text-ink-muted mt-1">
              Canvas completeness: {profile.completenessScore}%
            </p>
          )}
        </div>

        {/* Completeness checklist */}
        {profile && profile.completenessScore < 100 && (
          <div className="border border-line p-6">
            <p className="text-overline text-ink-muted mb-4">COMPLETE YOUR CANVAS</p>
            <div className="space-y-2">
              {COMPLETENESS_ITEMS.map(({ key, label, href }) => {
                const done =
                  key === 'avatarUrl' ? !!profile.avatarUrl :
                  key === 'bio' ? !!profile.bio :
                  false // services/projects/contacts tracked by count > 0
                return (
                  <Link
                    key={key}
                    href={href}
                    className="flex items-center gap-3 text-caption text-ink-soft hover:text-ink transition-colors py-1"
                  >
                    <span className={`w-3 h-3 border ${done ? 'bg-ink border-ink' : 'border-line'}`} />
                    <span className={done ? 'line-through text-ink-faint' : ''}>{label}</span>
                    <span className="ml-auto text-ink-faint">→</span>
                  </Link>
                )
              })}
            </div>
            <div className="mt-4 h-1 bg-bg-sunken">
              <div
                className="h-full bg-ink transition-all duration-500"
                style={{ width: `${profile.completenessScore}%` }}
              />
            </div>
          </div>
        )}

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-0 border-t border-l border-line">
          {[
            { label: 'PROFILE VIEWS (30D)', value: analytics?.viewsLast30d ?? '—' },
            { label: 'OUTREACH CLICKS (30D)', value: analytics?.outreachClicksLast30d ?? '—' },
            { label: 'TOTAL VIEWS', value: analytics?.totalViews ?? '—' },
          ].map((stat) => (
            <div key={stat.label} className="border-r border-b border-line p-6">
              <p className="text-overline text-ink-muted">{stat.label}</p>
              <p className="text-h2 font-bold text-ink mt-2">{stat.value}</p>
            </div>
          ))}
        </div>

        <Hairline />

        {/* Quick links */}
        <div>
          <p className="text-overline text-ink-muted mb-4">MANAGE</p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {[
              { href: '/dashboard/services', label: 'Services' },
              { href: '/dashboard/projects', label: 'Projects' },
              { href: '/dashboard/stories', label: 'Stories' },
              { href: '/dashboard/analytics', label: 'Analytics' },
            ].map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="border border-line p-4 text-caption font-bold text-ink hover:bg-bg-sunken transition-colors"
              >
                {item.label} →
              </Link>
            ))}
          </div>
        </div>
      </div>
    </>
  )
}
