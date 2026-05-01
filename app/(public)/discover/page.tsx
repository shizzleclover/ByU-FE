'use client'

import { Suspense, useState, useEffect, useRef } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { useInfiniteQuery } from '@tanstack/react-query'
import { Search, SlidersHorizontal, X, BadgeCheck, LayoutGrid, List } from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'
import { EditorialList } from '@/components/editorial/EditorialList'
import { AppSelect } from '@/components/ui/AppSelect'
import { apiGet } from '@/lib/api'
import { cn } from '@/lib/utils'
import type { DiscoveryResult, DiscoveryProfile } from '@/types/api'

const CATEGORIES = [
  { value: 'all', label: 'All' },
  { value: 'design', label: 'Design' },
  { value: 'web_app_dev', label: 'Development' },
  { value: 'writing_editing', label: 'Writing' },
  { value: 'photography_video', label: 'Photo & Video' },
  { value: 'music_audio', label: 'Music' },
  { value: 'tutoring_academic', label: 'Tutoring' },
  { value: 'social_marketing', label: 'Marketing' },
  { value: 'fashion_tailoring', label: 'Fashion' },
  { value: 'hair_beauty', label: 'Hair & Beauty' },
  { value: 'event_planning', label: 'Events' },
  { value: 'errands_tasks', label: 'Errands' },
  { value: 'other', label: 'Other' },
]

const SORT_OPTIONS = [
  { value: 'featured', label: 'Featured First' },
  { value: 'completeness', label: 'Most Complete' },
  { value: 'recent', label: 'Recently Active' },
]

const CATEGORY_OPTIONS = CATEGORIES.map((c) => ({
  value: c.value,
  label: c.value === 'all' ? 'All Categories' : c.label,
}))

const CATEGORY_LABEL: Record<string, string> = Object.fromEntries(
  CATEGORIES.map((c) => [c.value, c.label])
)

function ProfileCard({ profile }: { profile: DiscoveryProfile }) {
  const hasCover = !!profile.topProject?.coverUrl
  const hasImage = hasCover || !!profile.avatarUrl

  return (
    <Link href={`/${profile.username}`} className="group block">
      <div className="relative aspect-[3/4] overflow-hidden bg-bg-sunken">
        {/* Background image */}
        {hasCover ? (
          <Image
            src={profile.topProject!.coverUrl!}
            alt={profile.fullName}
            fill
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
            className="object-cover transition-transform duration-700 group-hover:scale-[1.04]"
          />
        ) : profile.avatarUrl ? (
          <Image
            src={profile.avatarUrl}
            alt={profile.fullName}
            fill
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
            className="object-cover object-top transition-transform duration-700 group-hover:scale-[1.04]"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-[72px] font-bold text-ink-ghost leading-none select-none">
              {profile.fullName[0]}
            </span>
          </div>
        )}

        {/* Gradient overlay */}
        {hasImage && (
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-transparent" />
        )}

        {/* Small avatar circle if showing project cover */}
        {hasCover && profile.avatarUrl && (
          <div className="absolute bottom-[52px] left-3">
            <div className="relative w-8 h-8 rounded-full overflow-hidden border-2 border-white/40">
              <Image src={profile.avatarUrl} alt="" fill sizes="32px" className="object-cover" />
            </div>
          </div>
        )}

        {/* Name + category pinned to bottom */}
        <div className="absolute bottom-0 left-0 right-0 p-3">
          <p className={cn(
            'text-[10px] font-bold tracking-[0.12em] uppercase leading-none mb-1',
            hasImage ? 'text-white/60' : 'text-ink-muted',
          )}>
            {profile.serviceCategories[0]
              ? CATEGORY_LABEL[profile.serviceCategories[0]] ?? profile.serviceCategories[0]
              : 'Student'}
          </p>
          <p className={cn(
            'font-bold text-[15px] leading-tight truncate',
            hasImage ? 'text-white' : 'text-ink',
          )}>
            {profile.fullName}
          </p>
        </div>

        {/* Verified badge */}
        {profile.isVerified && (
          <div className="absolute top-2.5 right-2.5 w-5 h-5 rounded-full bg-blue-500 flex items-center justify-center shadow shadow-blue-500/40">
            <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
              <path d="M2 5L4 7L8 3" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
        )}
      </div>
    </Link>
  )
}

function CardSkeleton() {
  return (
    <div className="animate-pulse">
      <div className="aspect-[3/4] bg-bg-sunken" />
    </div>
  )
}

type ViewMode = 'grid' | 'list'

function DiscoverContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [search, setSearch] = useState(searchParams.get('q') ?? '')
  const [category, setCategory] = useState(searchParams.get('category') ?? 'all')
  const [verified, setVerified] = useState(searchParams.get('verified') === 'true')
  const [sort, setSort] = useState(searchParams.get('sort') ?? 'featured')
  const [viewMode, setViewMode] = useState<ViewMode>('grid')
  const [filtersOpen, setFiltersOpen] = useState(false)
  const sentinelRef = useRef<HTMLDivElement>(null)
  const chipScrollRef = useRef<HTMLDivElement>(null)

  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isLoading } = useInfiniteQuery({
    queryKey: ['discovery', { search, category, verified, sort }],
    queryFn: ({ pageParam }) =>
      apiGet<DiscoveryResult>('/discover', {
        q: search || undefined,
        category: category !== 'all' ? category : undefined,
        verified: verified || undefined,
        sort,
        cursor: pageParam as string | undefined,
        limit: 20,
      }),
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (last) => last.nextCursor ?? undefined,
    staleTime: 60_000,
  })

  const profiles = data?.pages.flatMap((p) => p.items ?? []) ?? []
  const activeFilters = (category !== 'all' ? 1 : 0) + (verified ? 1 : 0) + (sort !== 'featured' ? 1 : 0)

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
    if (category !== 'all') params.set('category', category)
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

          {/* Desktop filters + view toggle */}
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

            {/* View toggle */}
            <div className="flex items-center border border-line">
              <button
                onClick={() => setViewMode('grid')}
                className={cn(
                  'p-1.5 transition-colors',
                  viewMode === 'grid' ? 'bg-ink text-bg' : 'text-ink-muted hover:text-ink',
                )}
                title="Grid view"
              >
                <LayoutGrid size={14} />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={cn(
                  'p-1.5 transition-colors',
                  viewMode === 'list' ? 'bg-ink text-bg' : 'text-ink-muted hover:text-ink',
                )}
                title="List view"
              >
                <List size={14} />
              </button>
            </div>
          </div>

          {/* Mobile: filter toggle + view toggle */}
          <div className="md:hidden flex items-center gap-3 shrink-0">
            {/* View toggle */}
            <div className="flex items-center border border-line">
              <button
                onClick={() => setViewMode('grid')}
                className={cn(
                  'p-1.5 transition-colors',
                  viewMode === 'grid' ? 'bg-ink text-bg' : 'text-ink-muted hover:text-ink',
                )}
              >
                <LayoutGrid size={13} />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={cn(
                  'p-1.5 transition-colors',
                  viewMode === 'list' ? 'bg-ink text-bg' : 'text-ink-muted hover:text-ink',
                )}
              >
                <List size={13} />
              </button>
            </div>

            <button
              className="flex items-center gap-1.5 text-caption text-ink-soft hover:text-ink transition-colors"
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
        </div>

        {/* Mobile: category chips (horizontal scroll) */}
        <div
          ref={chipScrollRef}
          className="md:hidden flex gap-2 px-5 py-2.5 overflow-x-auto scrollbar-none"
        >
          {CATEGORIES.map((cat) => (
            <button
              key={cat.value}
              onClick={() => setCategory(cat.value)}
              className={cn(
                'shrink-0 px-3 py-1.5 text-[11px] font-bold tracking-[0.08em] uppercase border transition-colors whitespace-nowrap',
                category === cat.value
                  ? 'bg-ink text-bg border-ink'
                  : 'bg-transparent text-ink-soft border-line hover:border-ink hover:text-ink',
              )}
            >
              {cat.label}
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
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
            {[...Array(8)].map((_, i) => <CardSkeleton key={i} />)}
          </div>
        ) : profiles.length === 0 ? (
          <div className="py-24 text-center">
            <p className="text-h2 font-bold text-ink-ghost leading-none">NOTHING HERE YET.</p>
            <p className="text-lead text-ink-muted mt-4 mb-8">Try broadening your filters.</p>
            {(category !== 'all' || verified || search) && (
              <button
                onClick={() => { setCategory('all'); setVerified(false); setSearch('') }}
                className="text-overline text-ink border-b border-ink hover:text-ink-soft transition-colors pb-0.5"
              >
                CLEAR FILTERS
              </button>
            )}
          </div>
        ) : (
          <>
            <p className="text-caption text-ink-muted mb-6">
              {profiles.length} student{profiles.length !== 1 ? 's' : ''}
              {category !== 'all' ? ` in ${CATEGORIES.find(c => c.value === category)?.label ?? category}` : ''}
            </p>

            {viewMode === 'grid' ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 md:gap-3">
                {profiles.map((p) => <ProfileCard key={p._id} profile={p} />)}
              </div>
            ) : (
              <>
                <div className="grid grid-cols-2 gap-2 md:hidden">
                  {profiles.map((p) => <ProfileCard key={p._id} profile={p} />)}
                </div>
                <div className="hidden md:block">
                  <EditorialList profiles={profiles} />
                </div>
              </>
            )}

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

export default function DiscoverPage() {
  return (
    <Suspense>
      <DiscoverContent />
    </Suspense>
  )
}
