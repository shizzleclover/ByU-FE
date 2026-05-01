'use client'

import Link from 'next/link'
import { useQuery } from '@tanstack/react-query'
import { motion } from 'framer-motion'
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

        {/* Verification status */}
        {user?.studentEmailVerifiedAt ? (
          <div className="flex items-center gap-4 border border-blue-200 bg-blue-50/50 px-5 py-4">
            <div className="relative shrink-0">
              <motion.div
                className="absolute inset-0 rounded-full bg-blue-500/20"
                animate={{ scale: [1, 1.5], opacity: [0.5, 0] }}
                transition={{ duration: 2, repeat: Infinity, ease: 'easeOut' }}
              />
              <div className="relative w-9 h-9 rounded-full bg-blue-500 flex items-center justify-center shadow shadow-blue-500/30">
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <motion.path
                    d="M4 8L6.5 10.5L12 5"
                    stroke="white"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    initial={{ pathLength: 0 }}
                    animate={{ pathLength: 1 }}
                    transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                  />
                </svg>
              </div>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-meta font-bold text-ink">Student Verified</p>
              <p className="text-caption text-ink-muted truncate">
                {user.studentEmail ?? 'Student email confirmed'} · Verified{' '}
                {new Date(user.studentEmailVerifiedAt).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
              </p>
            </div>
          </div>
        ) : (
          <Link
            href="/dashboard/settings/verification"
            className="flex items-center gap-4 border border-dashed border-line hover:border-blue-400 hover:bg-blue-50/30 px-5 py-4 transition-colors group"
          >
            <div className="w-9 h-9 rounded-full border-2 border-dashed border-line group-hover:border-blue-400 flex items-center justify-center transition-colors shrink-0">
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path d="M4 8L6.5 10.5L12 5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="text-ink-muted group-hover:text-blue-500 transition-colors" />
              </svg>
            </div>
            <div>
              <p className="text-meta font-bold text-ink">Get Student Verified</p>
              <p className="text-caption text-ink-muted">Verify your student email to earn a blue badge →</p>
            </div>
          </Link>
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
