'use client'

import Link from 'next/link'
import Image from 'next/image'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { X } from 'lucide-react'
import { toast } from 'sonner'
import { DashboardTopbar } from '@/components/layout/DashboardTopbar'
import { apiGet, apiDelete } from '@/lib/api'
import type { SavedProfile } from '@/types/api'

export default function SavedPage() {
  const qc = useQueryClient()

  const { data: saved = [], isLoading } = useQuery({
    queryKey: ['saved', 'me'],
    queryFn: () => apiGet<SavedProfile[]>('/saved'),
  })

  const unsave = useMutation({
    mutationFn: (profileId: string) => apiDelete(`/saved/${profileId}`),
    onMutate: async (profileId) => {
      await qc.cancelQueries({ queryKey: ['saved', 'me'] })
      const prev = qc.getQueryData<SavedProfile[]>(['saved', 'me'])
      qc.setQueryData<SavedProfile[]>(['saved', 'me'], (old) => old?.filter((s) => s.profile._id !== profileId) ?? [])
      return { prev }
    },
    onError: (_err, _id, ctx) => {
      if (ctx?.prev) qc.setQueryData(['saved', 'me'], ctx.prev)
      toast.error('Failed to remove.')
    },
  })

  return (
    <>
      <DashboardTopbar title="Saved" />
      <div className="flex-1 px-6 md:px-8 py-10 overflow-auto">
        <p className="text-caption text-ink-muted mb-8">{saved.length} saved profile{saved.length !== 1 ? 's' : ''}</p>

        {isLoading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {[...Array(8)].map((_, i) => <div key={i} className="h-40 bg-bg-sunken animate-pulse" />)}
          </div>
        ) : saved.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-h6 font-bold text-ink mb-2">No saved profiles</p>
            <p className="text-caption text-ink-muted mb-6">Discover students and save their canvases here.</p>
            <Link
              href="/discover"
              className="inline-flex items-center gap-2 text-overline bg-ink text-bg px-6 py-3 hover:bg-ink-soft transition-colors"
            >
              EXPLORE CANVASES →
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {saved.map(({ _id, profile }) => (
              <div key={_id} className="border border-line group relative">
                <button
                  onClick={() => unsave.mutate(profile._id)}
                  className="absolute top-2 right-2 bg-bg/80 p-1 hover:bg-state-error hover:text-white transition-colors opacity-0 group-hover:opacity-100 z-10"
                  title="Remove"
                >
                  <X size={13} />
                </button>
                <Link href={`/${profile.username}`} className="block p-4">
                  <div className="w-12 h-12 rounded-full overflow-hidden bg-bg-sunken mb-3">
                    {profile.avatarUrl ? (
                      <Image src={profile.avatarUrl} alt={profile.fullName} width={48} height={48} className="object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-ink-faint text-overline">
                        {profile.fullName.charAt(0)}
                      </div>
                    )}
                  </div>
                  <p className="text-meta font-bold text-ink line-clamp-1">{profile.fullName}</p>
                  <p className="text-caption text-ink-muted">@{profile.username}</p>
                  {profile.department && (
                    <p className="text-caption text-ink-muted mt-1 line-clamp-1">{profile.department}</p>
                  )}
                </Link>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  )
}
