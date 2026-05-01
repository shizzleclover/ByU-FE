'use client'

import { use } from 'react'
import { useQuery } from '@tanstack/react-query'
import { apiGet } from '@/lib/api'
import type { Story } from '@/types/api'
import StoryEditor from '../StoryEditor'

export default function EditStoryPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)

  const { data: story, isLoading } = useQuery({
    queryKey: ['stories', id],
    queryFn: () => apiGet<Story>(`/stories/${id}`),
  })

  if (isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <p className="text-caption text-ink-muted animate-pulse">Loading...</p>
      </div>
    )
  }

  if (!story) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <p className="text-caption text-ink-muted">Story not found.</p>
      </div>
    )
  }

  return <StoryEditor story={story} />
}
