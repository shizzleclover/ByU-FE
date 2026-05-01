'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Plus, Pencil, Trash2, Eye, EyeOff } from 'lucide-react'
import { toast } from 'sonner'
import { DashboardTopbar } from '@/components/layout/DashboardTopbar'
import { apiGet, apiPatch, apiDelete } from '@/lib/api'
import type { Project } from '@/types/api'

export default function ProjectsPage() {
  const qc = useQueryClient()
  const [deleting, setDeleting] = useState<string | null>(null)

  const { data: projects = [], isLoading } = useQuery({
    queryKey: ['projects', 'me'],
    queryFn: () => apiGet<Project[]>('/projects'),
  })

  const togglePublish = useMutation({
    mutationFn: ({ id, isPublished }: { id: string; isPublished: boolean }) =>
      apiPatch(`/projects/${id}`, { isPublished }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['projects', 'me'] }),
    onError: () => toast.error('Failed to update.'),
  })

  const remove = useMutation({
    mutationFn: (id: string) => apiDelete(`/projects/${id}`),
    onSuccess: (_, id) => {
      qc.setQueryData<Project[]>(['projects', 'me'], (old) => old?.filter((p) => p._id !== id) ?? [])
      toast.success('Project deleted.')
      setDeleting(null)
    },
    onError: () => toast.error('Failed to delete.'),
  })

  return (
    <>
      <DashboardTopbar title="Projects" />
      <div className="flex-1 px-6 md:px-8 py-10 overflow-auto">
        <div className="flex items-center justify-between mb-8">
          <p className="text-caption text-ink-muted">{projects.length} project{projects.length !== 1 ? 's' : ''}</p>
          <Link
            href="/dashboard/projects/new"
            className="flex items-center gap-2 text-overline bg-ink text-bg px-4 py-2 hover:bg-ink-soft transition-colors"
          >
            <Plus size={14} /> NEW PROJECT
          </Link>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-48 bg-bg-sunken animate-pulse" />
            ))}
          </div>
        ) : projects.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-h6 font-bold text-ink mb-2">No projects yet</p>
            <p className="text-caption text-ink-muted mb-6">Add your first project to showcase your work.</p>
            <Link
              href="/dashboard/projects/new"
              className="inline-flex items-center gap-2 text-overline bg-ink text-bg px-6 py-3 hover:bg-ink-soft transition-colors"
            >
              <Plus size={14} /> NEW PROJECT
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {projects.map((project) => (
              <div key={project._id} className="border border-line group">
                {project.coverUrl ? (
                  <div className="aspect-video relative overflow-hidden">
                    <Image
                      src={project.coverUrl}
                      alt={project.title}
                      fill
                      className="object-cover"
                    />
                  </div>
                ) : (
                  <div className="aspect-video bg-bg-sunken flex items-center justify-center">
                    <p className="text-overline text-ink-faint">NO COVER</p>
                  </div>
                )}

                <div className="p-4">
                  <div className="flex items-start justify-between gap-2 mb-1">
                    <p className="text-meta font-bold text-ink line-clamp-1">{project.title}</p>
                    <span className={`text-overline shrink-0 ${project.isPublished ? 'text-state-success' : 'text-ink-muted'}`}>
                      {project.isPublished ? 'LIVE' : 'DRAFT'}
                    </span>
                  </div>
                  {project.techStack?.length > 0 && (
                    <p className="text-caption text-ink-muted mb-3">{project.techStack.slice(0, 3).join(', ')}</p>
                  )}

                  <div className="flex items-center gap-2">
                    <Link
                      href={`/dashboard/projects/${project._id}`}
                      className="flex items-center gap-1.5 text-overline border border-line px-3 py-1.5 hover:border-ink transition-colors"
                    >
                      <Pencil size={11} /> EDIT
                    </Link>
                    <button
                      onClick={() => togglePublish.mutate({ id: project._id, isPublished: !project.isPublished })}
                      className="p-1.5 border border-line hover:border-ink transition-colors"
                      title={project.isPublished ? 'Unpublish' : 'Publish'}
                    >
                      {project.isPublished ? <EyeOff size={13} /> : <Eye size={13} />}
                    </button>
                    {deleting === project._id ? (
                      <div className="flex items-center gap-2 ml-auto">
                        <button
                          onClick={() => remove.mutate(project._id)}
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
                        onClick={() => setDeleting(project._id)}
                        className="p-1.5 border border-line hover:border-state-error hover:text-state-error transition-colors ml-auto"
                      >
                        <Trash2 size={13} />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  )
}
