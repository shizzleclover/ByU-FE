'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Plus, Pencil, Trash2, Eye, EyeOff } from 'lucide-react'
import { toast } from 'sonner'
import { DashboardTopbar } from '@/components/layout/DashboardTopbar'
import { apiGet, apiPatch, apiDelete } from '@/lib/api'
import type { Story } from '@/types/api'

export default function StoriesPage() {
  const qc = useQueryClient()
  const [deleting, setDeleting] = useState<string | null>(null)

  const { data: stories = [], isLoading } = useQuery({
    queryKey: ['stories', 'me'],
    queryFn: () => apiGet<Story[]>('/stories'),
  })

  const togglePublish = useMutation({
    mutationFn: ({ id, isPublished }: { id: string; isPublished: boolean }) =>
      apiPatch(`/stories/${id}`, { isPublished }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['stories', 'me'] }),
    onError: () => toast.error('Failed to update.'),
  })

  const remove = useMutation({
    mutationFn: (id: string) => apiDelete(`/stories/${id}`),
    onSuccess: (_, id) => {
      qc.setQueryData<Story[]>(['stories', 'me'], (old) => old?.filter((s) => s._id !== id) ?? [])
      toast.success('Story deleted.')
      setDeleting(null)
    },
    onError: () => toast.error('Failed to delete.'),
  })

  return (
    <>
      <DashboardTopbar title="Stories" />
      <div className="flex-1 px-6 md:px-8 py-10 overflow-auto">
        <div className="flex items-center justify-between mb-8">
          <p className="text-caption text-ink-muted">{stories.length} stor{stories.length !== 1 ? 'ies' : 'y'}</p>
          <Link
            href="/dashboard/stories/new"
            className="flex items-center gap-2 text-overline bg-ink text-bg px-4 py-2 hover:bg-ink-soft transition-colors"
          >
            <Plus size={14} /> NEW STORY
          </Link>
        </div>

        {isLoading ? (
          <div className="space-y-3">
            {[...Array(3)].map((_, i) => <div key={i} className="h-20 bg-bg-sunken animate-pulse" />)}
          </div>
        ) : stories.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-h6 font-bold text-ink mb-2">No stories yet</p>
            <p className="text-caption text-ink-muted mb-6">Share your thoughts, process, and insights.</p>
            <Link
              href="/dashboard/stories/new"
              className="inline-flex items-center gap-2 text-overline bg-ink text-bg px-6 py-3 hover:bg-ink-soft transition-colors"
            >
              <Plus size={14} /> NEW STORY
            </Link>
          </div>
        ) : (
          <div className="divide-y divide-line">
            {stories.map((story) => (
              <div key={story._id} className="flex items-center justify-between py-5 gap-4">
                <div className="min-w-0">
                  <div className="flex items-center gap-3 mb-1">
                    <p className="text-meta font-bold text-ink truncate">{story.title}</p>
                    <span className={`text-overline shrink-0 ${story.isPublished ? 'text-state-success' : 'text-ink-muted'}`}>
                      {story.isPublished ? 'LIVE' : 'DRAFT'}
                    </span>
                  </div>
                  <p className="text-caption text-ink-muted">
                    {story.readingTimeMinutes > 0 ? `${story.readingTimeMinutes} min read` : 'Empty'}
                    {story.publishedAt && ` · ${new Date(story.publishedAt).toLocaleDateString()}`}
                  </p>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <Link
                    href={`/dashboard/stories/${story._id}`}
                    className="p-1.5 border border-line hover:border-ink transition-colors"
                  >
                    <Pencil size={13} />
                  </Link>
                  <button
                    onClick={() => togglePublish.mutate({ id: story._id, isPublished: !story.isPublished })}
                    className="p-1.5 border border-line hover:border-ink transition-colors"
                    title={story.isPublished ? 'Unpublish' : 'Publish'}
                  >
                    {story.isPublished ? <EyeOff size={13} /> : <Eye size={13} />}
                  </button>
                  {deleting === story._id ? (
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => remove.mutate(story._id)}
                        className="text-overline text-state-error hover:underline"
                        disabled={remove.isPending}
                      >
                        CONFIRM
                      </button>
                      <button onClick={() => setDeleting(null)} className="text-caption text-ink-muted hover:text-ink">
                        Cancel
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => setDeleting(story._id)}
                      className="p-1.5 border border-line hover:border-state-error hover:text-state-error transition-colors"
                    >
                      <Trash2 size={13} />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  )
}
