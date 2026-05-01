'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { DashboardSidebar } from '@/components/layout/DashboardSidebar'
import { DashboardMobileNav } from '@/components/layout/DashboardMobileNav'
import { useAuth } from '@/hooks/useAuth'

export default function AuthedLayout({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.replace('/signin')
    }
  }, [isAuthenticated, isLoading, router])

  if (isLoading) {
    return (
      <div className="min-h-screen bg-bg flex items-center justify-center">
        <div className="text-overline text-ink-muted animate-pulse">LOADING</div>
      </div>
    )
  }

  if (!isAuthenticated) return null

  return (
    <div className="flex min-h-screen bg-bg">
      {/* Sidebar — desktop only */}
      <DashboardSidebar />

      {/* Main content — add bottom padding on mobile for the tab bar */}
      <div className="flex-1 flex flex-col min-w-0 pb-16 md:pb-0" id="main-content">
        {children}
      </div>

      {/* Bottom tab bar — mobile only */}
      <DashboardMobileNav />
    </div>
  )
}
