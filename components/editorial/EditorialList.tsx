'use client'

import { useState, useRef } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { motion } from 'framer-motion'
import { ease } from '@/lib/motion'
import { cn } from '@/lib/utils'
import type { DiscoveryProfile } from '@/types/api'

interface Props {
  profiles: DiscoveryProfile[]
  className?: string
}

export function EditorialList({ profiles, className }: Props) {
  const [hoveredId, setHoveredId] = useState<string | null>(null)
  const [cursorY, setCursorY] = useState(0)
  const containerRef = useRef<HTMLDivElement>(null)

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!containerRef.current) return
    const rect = containerRef.current.getBoundingClientRect()
    setCursorY(e.clientY - rect.top)
  }

  const hovered = profiles.find((p) => p._id === hoveredId)

  return (
    <div
      ref={containerRef}
      className={cn('relative flex gap-0', className)}
      onMouseMove={handleMouseMove}
      onMouseLeave={() => setHoveredId(null)}
    >
      {/* Name list — 60% */}
      <div className="flex-1 min-w-0">
        {profiles.map((profile, i) => (
          <Link
            key={profile._id}
            href={`/${profile.username}`}
            className="block border-b border-line py-3 group"
            onMouseEnter={() => setHoveredId(profile._id)}
          >
            <motion.p
              className="text-display font-bold leading-none truncate"
              animate={{
                color: hoveredId === null || hoveredId === profile._id
                  ? '#0F0F0E'
                  : '#E6E5DF',
              }}
              transition={{ duration: 0.2, ease: ease.out }}
            >
              {profile.fullName}
            </motion.p>
            <p className="text-caption text-ink-muted mt-1">
              {profile.serviceCategories[0] ?? 'Student'}
              {profile.department ? ` · ${profile.department}` : ''}
            </p>
          </Link>
        ))}
      </div>

      {/* Preview pane — 40% sticky */}
      <div className="hidden lg:block w-[38%] shrink-0 pl-12 relative">
        <div className="sticky top-24">
          <motion.div
            className="w-full"
            animate={{ opacity: hoveredId ? 1 : 0, x: hoveredId ? 0 : 20 }}
            transition={{ duration: 0.35, ease: ease.out }}
            style={{ transform: `translateY(${Math.min(cursorY - 120, 300)}px)` }}
          >
            {hovered && (
              <>
                {/* Cover or avatar */}
                {hovered.topProject?.coverUrl ? (
                  <div className="relative w-full aspect-[4/3] overflow-hidden">
                    <Image
                      src={hovered.topProject.coverUrl}
                      alt={hovered.topProject.title}
                      fill
                      className="object-cover"
                    />
                  </div>
                ) : hovered.avatar ? (
                  <div className="relative w-full aspect-[4/3] overflow-hidden bg-bg-sunken">
                    <Image
                      src={hovered.avatar}
                      alt={hovered.fullName}
                      fill
                      className="object-cover object-top"
                    />
                  </div>
                ) : (
                  <div className="w-full aspect-[4/3] bg-bg-sunken flex items-center justify-center">
                    <span className="text-h2 font-bold text-ink-ghost">
                      {hovered.fullName[0]}
                    </span>
                  </div>
                )}

                <div className="mt-4">
                  <p className="text-overline text-ink-muted">
                    {hovered.serviceCategories[0] ?? 'Student'}
                    {hovered.isVerified && ' · ✓ Verified'}
                  </p>
                  <p className="text-h5 font-bold text-ink mt-1">{hovered.fullName}</p>
                  {hovered.bio && (
                    <p className="text-caption text-ink-muted mt-2 line-clamp-2">{hovered.bio}</p>
                  )}
                  <Link
                    href={`/${hovered.username}`}
                    className="inline-flex items-center gap-2 text-overline text-ink mt-4 hover:gap-3 transition-all"
                  >
                    VIEW CANVAS →
                  </Link>
                </div>
              </>
            )}
          </motion.div>
        </div>
      </div>
    </div>
  )
}
