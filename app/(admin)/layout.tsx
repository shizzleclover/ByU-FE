'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { DashboardSidebar } from '@/components/layout/DashboardSidebar'
import { useAuth } from '@/hooks/useAuth'

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
    <div className="flex min-h-screen bg-bg">
      <DashboardSidebar />
      <div className="flex-1 flex flex-col min-w-0" id="main-content">
        {children}
      </div>
    </div>
  )
}
