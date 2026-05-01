'use client'

import Link from 'next/link'
import { ExternalLink } from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'

interface Props {
  title: string
}

export function DashboardTopbar({ title }: Props) {
  const { user } = useAuth()

  return (
    <header className="h-14 border-b border-line bg-bg flex items-center px-6 md:px-8 justify-between shrink-0">
      <h1 className="text-h6 font-bold text-ink">{title}</h1>

      <div className="flex items-center gap-4">
        {user && (
          <Link
            href={`/${user.username}`}
            target="_blank"
            className="text-caption text-ink-muted hover:text-ink transition-colors flex items-center gap-1.5"
          >
            View canvas
            <ExternalLink size={12} />
          </Link>
        )}
      </div>
    </header>
  )
}
