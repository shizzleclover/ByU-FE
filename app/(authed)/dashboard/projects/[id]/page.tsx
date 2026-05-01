'use client'

import { use } from 'react'
import { useQuery } from '@tanstack/react-query'
import { apiGet } from '@/lib/api'
import type { Project } from '@/types/api'
import ProjectEditor from '../ProjectEditor'

export default function EditProjectPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)

  const { data: project, isLoading } = useQuery({
    queryKey: ['projects', id],
    queryFn: () => apiGet<Project>(`/projects/${id}`),
  })

  if (isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <p className="text-caption text-ink-muted animate-pulse">Loading...</p>
      </div>
    )
  }

  if (!project) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <p className="text-caption text-ink-muted">Project not found.</p>
      </div>
    )
  }

  return <ProjectEditor project={project} />
}
