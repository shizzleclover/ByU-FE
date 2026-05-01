'use client'

import { useState, useEffect } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors,
  type DragEndEvent,
} from '@dnd-kit/core'
import {
  SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy,
  useSortable, arrayMove,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { GripVertical, ExternalLink } from 'lucide-react'
import { toast } from 'sonner'
import { DashboardTopbar } from '@/components/layout/DashboardTopbar'
import { apiGet, apiPatch } from '@/lib/api'
import type { Profile } from '@/types/api'
import { useAuth } from '@/hooks/useAuth'

const SECTION_LABELS: Record<string, string> = {
  services: 'Services',
  projects: 'Projects',
  links: 'Links',
  stories: 'Stories',
  resume: 'Resume',
}

const DEFAULT_LAYOUT = ['services', 'projects', 'links', 'stories', 'resume']

function SortableItem({ id }: { id: string }) {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id })
  return (
    <div
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition }}
      className="flex items-center gap-4 border border-line p-4 bg-bg hover:bg-bg-sunken transition-colors select-none"
    >
      <button {...listeners} {...attributes} className="text-ink-faint hover:text-ink transition-colors cursor-grab active:cursor-grabbing">
        <GripVertical size={18} />
      </button>
      <span className="text-meta font-bold text-ink">{SECTION_LABELS[id] ?? id}</span>
    </div>
  )
}

export default function CanvasLayoutPage() {
  const qc = useQueryClient()
  const { user } = useAuth()

  const { data: profile } = useQuery({
    queryKey: ['profile', 'me'],
    queryFn: () => apiGet<Profile>('/profile/me'),
  })

  const [layout, setLayout] = useState(DEFAULT_LAYOUT)

  useEffect(() => {
    if (profile?.canvasLayout?.length) setLayout(profile.canvasLayout)
  }, [profile])

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  )

  const save = useMutation({
    mutationFn: (sections: string[]) => apiPatch('/profile/me/canvas-layout', { sections }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['profile', 'me'] })
      toast.success('Layout saved.')
    },
    onError: () => toast.error('Failed to save.'),
  })

  const onDragEnd = (e: DragEndEvent) => {
    const { active, over } = e
    if (!over || active.id === over.id) return
    const oldIndex = layout.indexOf(active.id as string)
    const newIndex = layout.indexOf(over.id as string)
    const next = arrayMove(layout, oldIndex, newIndex)
    setLayout(next)
    save.mutate(next)
  }

  return (
    <>
      <DashboardTopbar title="Canvas Layout" />
      <div className="flex-1 px-6 md:px-8 py-10 max-w-[600px] overflow-auto">
        <p className="text-caption text-ink-muted mb-2">
          Drag sections to reorder. The header is always first. Empty sections won't show on your public canvas.
        </p>
        {user && (
          <a
            href={`/${user.username}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-caption text-ink-muted hover:text-ink transition-colors mb-8"
          >
            Preview canvas <ExternalLink size={11} />
          </a>
        )}

        {/* Locked header */}
        <div className="flex items-center gap-4 border border-line p-4 bg-bg-sunken mb-2">
          <span className="w-[18px]" />
          <span className="text-meta font-bold text-ink-muted">Header (locked)</span>
        </div>

        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={onDragEnd}>
          <SortableContext items={layout} strategy={verticalListSortingStrategy}>
            <div className="flex flex-col gap-2">
              {layout.map((id) => <SortableItem key={id} id={id} />)}
            </div>
          </SortableContext>
        </DndContext>
      </div>
    </>
  )
}
