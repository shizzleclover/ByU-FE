'use client'

import { useState, useEffect, useRef } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { useInfiniteQuery } from '@tanstack/react-query'
import { Search, SlidersHorizontal, X, BadgeCheck } from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'
import { EditorialList } from '@/components/editorial/EditorialList'
import { AppSelect } from '@/components/ui/AppSelect'
import { apiGet } from '@/lib/api'
import { cn } from '@/lib/utils'
import type { DiscoveryResult, DiscoveryProfile } from '@/types/api'

const CATEGORIES = [
  'All', 'Design', 'Development', 'Writing', 'Photography',
  'Video', 'Music', 'Tutoring', 'Marketing', 'Fashion', 'Crafts', 'Consulting',
]

const SORT_OPTIONS = [
  { value: 'featured', label: 'Featured First' },
  { value: 'completeness', label: 'Most Complete' },
  { value: 'recent', label: 'Recently Active' },
]

const CATEGORY_OPTIONS = CATEGORIES.map((c) => ({
  value: c,
  label: c === 'All' ? 'All Categories' : c,
}))

// Mobile profile card
function ProfileCard({ profile }: { profile: DiscoveryProfile }) {
  return (
    <Link
      href={`/${profile.username}`}
      className="group block border border-line bg-bg hover:bg-bg-sunken transition-colors"
    >
      {/* Cover / avatar */}
      <div className="relative aspect-[4/3] overflow-hidden bg-bg-sunken">
        {profile.topProject?.coverUrl ? (
          <Image
            src={profile.topProject.coverUrl}
            alt={profile.topProject.title}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
          />
        ) : profile.avatar ? (
          <Image
            src={profile.avatar}
            alt={profile.fullName}
            fill
            className="object-cover object-top"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <span className="text-h2 font-bold text-ink-ghost">
              {profile.fullName[0]}
            </span>
          </div>
        )}
        {profile.isVerified && (
          <span className="absolute top-2 right-2 bg-bg/90 backdrop-blur-sm px-2 py-0.5 flex items-center gap-1">
            <BadgeCheck size={11} className="text-ink" />
            <span className="text-[10px] font-bold text-ink tracking-[0.08em]">VERIFIED</span>
          </span>
        )}
      </div>

      {/* Info */}
      <div className="p-3">
        <p className="text-[10px] font-bold tracking-[0.1em] text-ink-muted uppercase leading-none mb-1">
          {profile.serviceCategories[0] ?? 'Student'}
          {profile.department ? ` · ${profile.department}` : ''}
        </p>
        <p className="text-meta font-bold text-ink leading-tight line-clamp-1">
          {profile.fullName}
        </p>
        {profile.bio && (
          <p className="text-[11px] text-ink-muted mt-1 line-clamp-2 leading-snug">
            {profile.bio}
          </p>
        )}
        <p className="text-[10px] font-bold tracking-[0.1em] text-ink mt-2 opacity-0 group-hover:opacity-100 transition-opacity">
          VIEW CANVAS →
        </p>
      </div>
    </Link>
  )
}

// Skeleton card
function CardSkeleton() {
  return (
    <div className="border border-line animate-pulse">
      <div className="aspect-[4/3] bg-bg-sunken" />
      <div className="p-3 space-y-2">
        <div className="h-2.5 bg-bg-sunken w-1/3 rounded" />
        <div className="h-3.5 bg-bg-sunken w-2/3 rounded" />
        <div className="h-2.5 bg-bg-sunken w-full rounded" />
      </div>
    </div>
  )
}

export default function DiscoverPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [search, setSearch] = useState(searchParams.get('q') ?? '')
  const [category, setCategory] = useState(searchParams.get('category') ?? 'All')
  const [verified, setVerified] = useState(searchParams.get('verified') === 'true')
  const [sort, setSort] = useState(searchParams.get('sort') ?? 'featured')
  const [filtersOpen, setFiltersOpen] = useState(false)
  const sentinelRef = useRef<HTMLDivElement>(null)
  const chipScrollRef = useRef<HTMLDivElement>(null)

  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isLoading } = useInfiniteQuery({
    queryKey: ['discovery', { search, category, verified, sort }],
    queryFn: ({ pageParam }) =>
      apiGet<DiscoveryResult>('/discovery', {
        q: search || undefined,
        category: category !== 'All' ? category : undefined,
        verified: verified || undefined,
        sort,
        cursor: pageParam as string | undefined,
        limit: 20,
      }),
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (last) => last.nextCursor,
    staleTime: 60_000,
  })

  const profiles = data?.pages.flatMap((p) => p.profiles) ?? []
  const activeFilters = (category !== 'All' ? 1 : 0) + (verified ? 1 : 0) + (sort !== 'featured' ? 1 : 0)

  // Infinite scroll
  useEffect(() => {
    const el = sentinelRef.current
    if (!el) return
    const obs = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting && hasNextPage) fetchNextPage() },
      { threshold: 0.1 },
    )
    obs.observe(el)
    return () => obs.disconnect()
  }, [hasNextPage, fetchNextPage])

  // Sync URL
  useEffect(() => {
    const params = new URLSearchParams()
    if (search) params.set('q', search)
    if (category !== 'All') params.set('category', category)
    if (verified) params.set('verified', 'true')
    if (sort !== 'featured') params.set('sort', sort)
    router.replace(`/discover${params.toString() ? `?${params}` : ''}`, { scroll: false })
  }, [search, category, verified, sort, router])

  return (
    <div className="min-h-screen bg-bg">
      {/* ── Page header ──────────────────────────────── */}
      <div className="px-5 md:px-12 lg:px-16 pt-10 pb-8 md:pt-16 md:pb-10 border-b border-line">
        <p className="text-overline text-ink-muted mb-2">DISCOVER</p>
        <h1 className="text-h1 font-bold text-ink leading-none">TALENTS.</h1>
      </div>

      {/* ── Sticky filters ───────────────────────────── */}
      <div className="sticky top-[60px] z-30 bg-bg/95 backdrop-blur-sm border-b border-line">

        {/* Search row — always visible */}
        <div className="flex items-center gap-3 px-5 md:px-12 lg:px-16 py-3 border-b border-line md:border-b-0">
          <div className="relative flex-1">
            <Search size={14} className="absolute left-0 top-1/2 -translate-y-1/2 text-ink-muted pointer-events-none" />
            <input
              type="text"
              placeholder="Search students..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-5 pb-1 border-b border-line bg-transparent text-body text-ink placeholder:text-ink-faint focus:outline-none focus:border-ink transition-colors"
            />
            {search && (
              <button
                onClick={() => setSearch('')}
                className="absolute right-0 top-1/2 -translate-y-1/2 text-ink-muted hover:text-ink transition-colors"
              >
                <X size={14} />
              </button>
            )}
          </div>

          {/* Desktop filters */}
          <div className="hidden md:flex items-center gap-6">
            <AppSelect
              options={CATEGORY_OPTIONS}
              value={category}
              onChange={setCategory}
              className="min-w-[140px]"
            />
            <label className="flex items-center gap-2 cursor-pointer select-none text-caption text-ink-soft whitespace-nowrap">
              <span
                onClick={() => setVerified((v) => !v)}
                className={cn(
                  'w-8 h-4 border transition-colors relative cursor-pointer',
                  verified ? 'bg-ink border-ink' : 'bg-transparent border-line',
                )}
              >
                <span className={cn(
                  'absolute top-0.5 w-3 h-3 transition-transform duration-200',
                  verified ? 'bg-bg translate-x-4' : 'bg-ink-muted translate-x-0.5',
                )} />
              </span>
              Verified only
            </label>
            <AppSelect
              options={SORT_OPTIONS}
              value={sort}
              onChange={setSort}
              className="min-w-[140px]"
            />
          </div>

          {/* Mobile filter toggle */}
          <button
            className="md:hidden flex items-center gap-1.5 text-caption text-ink-soft hover:text-ink transition-colors shrink-0"
            onClick={() => setFiltersOpen((o) => !o)}
          >
            <SlidersHorizontal size={15} strokeWidth={1.5} />
            {activeFilters > 0 && (
              <span className="w-4 h-4 bg-ink text-bg text-[9px] font-bold flex items-center justify-center rounded-full">
                {activeFilters}
              </span>
            )}
          </button>
        </div>

        {/* Mobile: category chips (horizontal scroll) */}
        <div
          ref={chipScrollRef}
          className="md:hidden flex gap-2 px-5 py-2.5 overflow-x-auto scrollbar-none"
        >
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setCategory(cat)}
              className={cn(
                'shrink-0 px-3 py-1.5 text-[11px] font-bold tracking-[0.08em] uppercase border transition-colors whitespace-nowrap',
                category === cat
                  ? 'bg-ink text-bg border-ink'
                  : 'bg-transparent text-ink-soft border-line hover:border-ink hover:text-ink',
              )}
            >
              {cat === 'All' ? 'All' : cat}
            </button>
          ))}
        </div>

        {/* Mobile: expanded filter panel */}
        <div className={cn(
          'md:hidden overflow-hidden transition-all duration-300',
          filtersOpen ? 'max-h-40 border-t border-line' : 'max-h-0',
        )}>
          <div className="px-5 py-4 flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <span className="text-overline text-ink-muted">SORT BY</span>
              <AppSelect
                options={SORT_OPTIONS}
                value={sort}
                onChange={setSort}
                className="min-w-[160px]"
              />
            </div>
            <label className="flex items-center justify-between cursor-pointer">
              <span className="text-overline text-ink-muted">VERIFIED ONLY</span>
              <span
                onClick={() => setVerified((v) => !v)}
                className={cn(
                  'w-10 h-5 border transition-colors relative cursor-pointer',
                  verified ? 'bg-ink border-ink' : 'bg-transparent border-line',
                )}
              >
                <span className={cn(
                  'absolute top-0.5 w-4 h-4 transition-transform duration-200',
                  verified ? 'bg-bg translate-x-5' : 'bg-ink-muted translate-x-0.5',
                )} />
              </span>
            </label>
          </div>
        </div>
      </div>

      {/* ── Results ──────────────────────────────────── */}
      <div className="px-5 md:px-12 lg:px-16 py-8 md:py-12">
        {isLoading ? (
          <>
            {/* Mobile skeleton grid */}
            <div className="grid grid-cols-2 gap-3 md:hidden">
              {[...Array(6)].map((_, i) => <CardSkeleton key={i} />)}
            </div>
            {/* Desktop skeleton list */}
            <div className="hidden md:block space-y-3">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="h-16 bg-bg-sunken animate-pulse" />
              ))}
            </div>
          </>
        ) : profiles.length === 0 ? (
          <div className="py-24 text-center">
            <p className="text-h2 font-bold text-ink-ghost leading-none">NOTHING HERE YET.</p>
            <p className="text-lead text-ink-muted mt-4 mb-8">Try broadening your filters.</p>
            {(category !== 'All' || verified || search) && (
              <button
                onClick={() => { setCategory('All'); setVerified(false); setSearch('') }}
                className="text-overline text-ink border-b border-ink hover:text-ink-soft transition-colors pb-0.5"
              >
                CLEAR FILTERS
              </button>
            )}
          </div>
        ) : (
          <>
            {/* Count */}
            <p className="text-caption text-ink-muted mb-6">
              {profiles.length} student{profiles.length !== 1 ? 's' : ''}
              {category !== 'All' ? ` in ${category}` : ''}
            </p>

            {/* Mobile: 2-col card grid */}
            <div className="grid grid-cols-2 gap-3 md:hidden">
              {profiles.map((p) => <ProfileCard key={p._id} profile={p} />)}
            </div>

            {/* Desktop: editorial list */}
            <div className="hidden md:block">
              <EditorialList profiles={profiles} />
            </div>

            <div ref={sentinelRef} className="h-4 mt-8" />
            {isFetchingNextPage && (
              <p className="text-caption text-ink-muted text-center py-8 animate-pulse">
                LOADING MORE...
              </p>
            )}
          </>
        )}
      </div>
    </div>
  )
}
