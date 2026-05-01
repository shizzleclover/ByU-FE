'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Plus, Pencil, Trash2, GripVertical, ToggleLeft, ToggleRight } from 'lucide-react'
import { toast } from 'sonner'
import {
  DndContext, closestCenter, PointerSensor, KeyboardSensor, useSensor, useSensors, type DragEndEvent,
} from '@dnd-kit/core'
import {
  SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy, useSortable, arrayMove,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { DashboardTopbar } from '@/components/layout/DashboardTopbar'
import { apiGet, apiPost, apiPatch, apiDelete } from '@/lib/api'
import type { Link } from '@/types/api'

const schema = z.object({
  label: z.string().min(1, 'Label is required').max(60),
  url: z.string().url('Must be a valid URL'),
})

type FormData = z.infer<typeof schema>

function SortableLink({
  link,
  onEdit,
  onDelete,
  onToggle,
}: {
  link: Link
  onEdit: (l: Link) => void
  onDelete: (id: string) => void
  onToggle: (id: string, isActive: boolean) => void
}) {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: link._id })

  return (
    <div
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition }}
      className="flex items-center gap-3 border border-line p-4 bg-bg"
    >
      <button {...listeners} {...attributes} className="text-ink-faint hover:text-ink cursor-grab active:cursor-grabbing">
        <GripVertical size={16} />
      </button>

      <div className="flex-1 min-w-0">
        <p className="text-meta font-bold text-ink truncate">{link.label}</p>
        <p className="text-caption text-ink-muted truncate">{link.url}</p>
      </div>

      <div className="flex items-center gap-2 shrink-0">
        <button
          onClick={() => onToggle(link._id, !link.isActive)}
          className={`transition-colors ${link.isActive ? 'text-state-success' : 'text-ink-faint'}`}
          title={link.isActive ? 'Deactivate' : 'Activate'}
        >
          {link.isActive ? <ToggleRight size={20} /> : <ToggleLeft size={20} />}
        </button>
        <button onClick={() => onEdit(link)} className="p-1.5 border border-line hover:border-ink transition-colors">
          <Pencil size={13} />
        </button>
        <button onClick={() => onDelete(link._id)} className="p-1.5 border border-line hover:border-state-error hover:text-state-error transition-colors">
          <Trash2 size={13} />
        </button>
      </div>
    </div>
  )
}

export default function LinksPage() {
  const qc = useQueryClient()
  const [editing, setEditing] = useState<Link | null>(null)
  const [showForm, setShowForm] = useState(false)

  const { data: links = [] } = useQuery({
    queryKey: ['links', 'me'],
    queryFn: () => apiGet<Link[]>('/links'),
  })

  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(schema),
  })

  const openAdd = () => { setEditing(null); reset({}); setShowForm(true) }
  const openEdit = (l: Link) => { setEditing(l); reset({ label: l.label, url: l.url }); setShowForm(true) }
  const close = () => { setShowForm(false); setEditing(null) }

  const save = useMutation({
    mutationFn: (d: FormData) => editing ? apiPatch(`/links/${editing._id}`, d) : apiPost('/links', d),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['links', 'me'] }); toast.success(editing ? 'Updated.' : 'Added.'); close() },
    onError: () => toast.error('Failed to save.'),
  })

  const remove = useMutation({
    mutationFn: (id: string) => apiDelete(`/links/${id}`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['links', 'me'] }),
  })

  const toggle = useMutation({
    mutationFn: ({ id, isActive }: { id: string; isActive: boolean }) => apiPatch(`/links/${id}`, { isActive }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['links', 'me'] }),
  })

  const reorder = useMutation({
    mutationFn: (ids: string[]) => apiPatch('/links/reorder', { ids }),
  })

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  )

  const onDragEnd = (e: DragEndEvent) => {
    const { active, over } = e
    if (!over || active.id === over.id) return
    const oldIdx = links.findIndex((l) => l._id === active.id)
    const newIdx = links.findIndex((l) => l._id === over.id)
    const next = arrayMove(links, oldIdx, newIdx)
    qc.setQueryData<Link[]>(['links', 'me'], next)
    reorder.mutate(next.map((l) => l._id))
  }

  return (
    <>
      <DashboardTopbar title="Links" />
      <div className="flex-1 px-6 md:px-8 py-10 max-w-[700px] overflow-auto">
        <div className="flex items-center justify-between mb-8">
          <p className="text-caption text-ink-muted">{links.length} link{links.length !== 1 ? 's' : ''}</p>
          <button
            onClick={openAdd}
            className="flex items-center gap-2 text-overline bg-ink text-bg px-4 py-2 hover:bg-ink-soft transition-colors"
          >
            <Plus size={14} /> ADD LINK
          </button>
        </div>

        {showForm && (
          <div className="border border-line p-6 mb-6">
            <p className="text-overline text-ink-muted mb-6">{editing ? 'EDIT LINK' : 'NEW LINK'}</p>
            <form onSubmit={handleSubmit((d) => save.mutate(d))} className="space-y-5">
              <div>
                <label className="text-overline text-ink-muted block mb-2">LABEL</label>
                <input {...register('label')} placeholder="My Portfolio" className="w-full border-b border-line bg-transparent text-body text-ink pb-2 focus:outline-none focus:border-ink" />
                {errors.label && <p className="text-caption text-state-error mt-1">{errors.label.message}</p>}
              </div>
              <div>
                <label className="text-overline text-ink-muted block mb-2">URL</label>
                <input {...register('url')} placeholder="https://..." className="w-full border-b border-line bg-transparent text-body text-ink pb-2 focus:outline-none focus:border-ink" />
                {errors.url && <p className="text-caption text-state-error mt-1">{errors.url.message}</p>}
              </div>
              <div className="flex gap-3">
                <button type="submit" disabled={isSubmitting} className="bg-ink text-bg text-overline px-6 py-2.5 hover:bg-ink-soft transition-colors disabled:opacity-50">
                  SAVE →
                </button>
                <button type="button" onClick={close} className="text-caption text-ink-muted hover:text-ink transition-colors">Cancel</button>
              </div>
            </form>
          </div>
        )}

        {links.length === 0 && !showForm ? (
          <p className="text-caption text-ink-muted py-8 text-center">No links yet. Add your first one above.</p>
        ) : (
          <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={onDragEnd}>
            <SortableContext items={links.map((l) => l._id)} strategy={verticalListSortingStrategy}>
              <div className="flex flex-col gap-2">
                {links.map((link) => (
                  <SortableLink
                    key={link._id}
                    link={link}
                    onEdit={openEdit}
                    onDelete={(id) => remove.mutate(id)}
                    onToggle={(id, isActive) => toggle.mutate({ id, isActive })}
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
