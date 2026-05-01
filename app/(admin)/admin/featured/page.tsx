'use client'

import { useState } from 'react'
import Image from 'next/image'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { Trash2, GripVertical, Search } from 'lucide-react'
import {
  DndContext, closestCenter, PointerSensor, useSensor, useSensors, type DragEndEvent,
} from '@dnd-kit/core'
import {
  SortableContext, useSortable, verticalListSortingStrategy, arrayMove,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { DashboardTopbar } from '@/components/layout/DashboardTopbar'
import { apiGet, apiPost, apiPatch, apiDelete } from '@/lib/api'
import { useDebouncedValue } from '@/hooks/useDebouncedValue'
import type { DiscoveryProfile } from '@/types/api'

interface FeaturedProfile {
  _id: string
  userId: string
  username: string
  fullName: string
  avatarUrl?: string
  order: number
}

function SortableFeatured({ profile, onRemove }: { profile: FeaturedProfile; onRemove: () => void }) {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: profile._id })
  return (
    <div
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition }}
      className="flex items-center gap-4 border border-line p-4 bg-bg"
    >
      <button {...listeners} {...attributes} className="text-ink-faint hover:text-ink cursor-grab">
        <GripVertical size={16} />
      </button>
      <div className="w-8 h-8 rounded-full overflow-hidden bg-bg-sunken shrink-0">
        {profile.avatarUrl ? (
          <Image src={profile.avatarUrl} alt={profile.fullName} width={32} height={32} className="object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-ink-faint text-overline">
            {profile.fullName.charAt(0)}
          </div>
        )}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-meta font-bold text-ink">{profile.fullName}</p>
        <p className="text-caption text-ink-muted">@{profile.username}</p>
      </div>
      <button onClick={onRemove} className="p-1.5 border border-line hover:border-state-error hover:text-state-error transition-colors">
        <Trash2 size={13} />
      </button>
    </div>
  )
}

export default function AdminFeaturedPage() {
  const qc = useQueryClient()
  const [query, setQuery] = useState('')
  const debouncedQ = useDebouncedValue(query, 300)

  const { data: featured = [] } = useQuery({
    queryKey: ['admin', 'featured'],
    queryFn: () => apiGet<FeaturedProfile[]>('/admin/featured'),
  })

  const { data: searchResults = [] } = useQuery({
    queryKey: ['admin', 'users', 'search', debouncedQ],
    queryFn: () => debouncedQ.length > 1 ? apiGet<DiscoveryProfile[]>(`/admin/users?q=${debouncedQ}&limit=8`) : [],
    enabled: debouncedQ.length > 1,
  })

  const add = useMutation({
    mutationFn: (userId: string) => apiPost('/admin/featured', { userId }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['admin', 'featured'] }); setQuery('') },
    onError: () => toast.error('Failed to add.'),
  })

  const remove = useMutation({
    mutationFn: (userId: string) => apiDelete(`/admin/featured/${userId}`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin', 'featured'] }),
    onError: () => toast.error('Failed to remove.'),
  })

  const reorder = useMutation({
    mutationFn: (ids: string[]) => apiPatch('/admin/featured/reorder', { ids }),
  })

  const sensors = useSensors(useSensor(PointerSensor))

  const onDragEnd = (e: DragEndEvent) => {
    const { active, over } = e
    if (!over || active.id === over.id) return
    const oldIdx = featured.findIndex((f) => f._id === active.id)
    const newIdx = featured.findIndex((f) => f._id === over.id)
    const next = arrayMove(featured, oldIdx, newIdx)
    qc.setQueryData<FeaturedProfile[]>(['admin', 'featured'], next)
    reorder.mutate(next.map((f) => f.userId))
  }

  const featuredUserIds = new Set(featured.map((f) => f.userId))

  return (
    <>
      <DashboardTopbar title="Featured Profiles" />
      <div className="flex-1 px-6 md:px-8 py-10 overflow-auto max-w-[700px]">
        {/* Search to add */}
        <div className="mb-8">
          <p className="text-overline text-ink-muted mb-3">ADD TO FEATURED</p>
          <div className="relative">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-muted" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search by name or username..."
              className="w-full pl-9 border-b border-line bg-transparent text-body text-ink pb-2 focus:outline-none focus:border-ink"
            />
          </div>
          {debouncedQ.length > 1 && searchResults.length > 0 && (
            <div className="border border-line mt-1 bg-bg shadow-sm">
              {searchResults
                .filter((u) => !featuredUserIds.has(u._id))
                .map((user) => (
                  <button
                    key={user._id}
                    onClick={() => add.mutate(user._id)}
                    disabled={add.isPending}
                    className="w-full text-left flex items-center gap-3 px-4 py-3 hover:bg-bg-sunken transition-colors"
                  >
                    <div className="w-7 h-7 rounded-full overflow-hidden bg-bg-sunken shrink-0">
                      {user.avatarUrl ? (
                        <Image src={user.avatarUrl} alt={user.fullName} width={28} height={28} className="object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-ink-faint text-overline">
                          {user.fullName.charAt(0)}
                        </div>
                      )}
                    </div>
                    <div>
                      <p className="text-meta text-ink">{user.fullName}</p>
                      <p className="text-caption text-ink-muted">@{user.username}</p>
                    </div>
                  </button>
                ))}
            </div>
          )}
        </div>

        {/* Featured list */}
        <p className="text-overline text-ink-muted mb-4">FEATURED ({featured.length})</p>
        {featured.length === 0 ? (
          <p className="text-caption text-ink-muted py-8 text-center">No featured profiles. Search above to add some.</p>
        ) : (
          <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={onDragEnd}>
            <SortableContext items={featured.map((f) => f._id)} strategy={verticalListSortingStrategy}>
              <div className="flex flex-col gap-2">
                {featured.map((profile) => (
                  <SortableFeatured
                    key={profile._id}
                    profile={profile}
                    onRemove={() => remove.mutate(profile.userId)}
                  />
                ))}
              </div>
            </SortableContext>
          </DndContext>
        )}
      </div>
    </>
  )
}
