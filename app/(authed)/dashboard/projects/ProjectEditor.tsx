'use client'

import { useState, useRef, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { useForm, useFieldArray, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { Plus, Trash2, Upload, GripVertical, X } from 'lucide-react'
import { toast } from 'sonner'
import Image from 'next/image'
import dynamic from 'next/dynamic'
import {
  DndContext, closestCenter, PointerSensor, useSensor, useSensors, type DragEndEvent,
} from '@dnd-kit/core'
import {
  SortableContext, useSortable, verticalListSortingStrategy, arrayMove,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { DashboardTopbar } from '@/components/layout/DashboardTopbar'
import { AppSelect } from '@/components/ui/AppSelect'
import { apiPost, apiPatch } from '@/lib/api'
import type { Project, UploadSignature } from '@/types/api'

const MDEditor = dynamic(() => import('@uiw/react-md-editor'), { ssr: false })

const LINK_TYPES = ['live', 'github', 'figma', 'case_study', 'video', 'other'] as const

const schema = z.object({
  title: z.string().min(1, 'Title is required').max(100),
  slug: z.string().min(1).max(100).regex(/^[a-z0-9-]+$/, 'Lowercase letters, numbers, hyphens only'),
  tagline: z.string().max(140).optional(),
  techStack: z.string().optional(),
  links: z.array(z.object({
    label: z.string().min(1, 'Label required'),
    url: z.string().url('Must be a valid URL'),
    type: z.enum(['live', 'github', 'figma', 'case_study', 'video', 'other']),
  })).optional(),
})

type FormData = z.infer<typeof schema>

interface GalleryUpload {
  url: string
  publicId: string
}

async function uploadToCloudinary(file: File, sig: UploadSignature): Promise<GalleryUpload> {
  const fd = new FormData()
  fd.append('file', file)
  fd.append('api_key', sig.apiKey)
  fd.append('timestamp', String(sig.timestamp))
  fd.append('signature', sig.signature)
  fd.append('folder', sig.folder)
  // Do NOT append upload_preset — signed uploads don't use presets
  const res = await fetch(`https://api.cloudinary.com/v1_1/${sig.cloudName}/image/upload`, {
    method: 'POST',
    body: fd,
  })
  const data = await res.json()
  if (!data.secure_url) throw new Error(data.error?.message ?? 'Upload failed')
  return { url: data.secure_url as string, publicId: data.public_id as string }
}

function SortableGalleryItem({ id, url, onRemove }: { id: string; url: string; onRemove: () => void }) {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id })
  return (
    <div
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition }}
      className="relative aspect-square border border-line overflow-hidden group"
    >
      <Image src={url} alt="" fill sizes="25vw" className="object-cover" />
      <button
        {...listeners}
        {...attributes}
        className="absolute top-1 left-1 bg-bg/80 p-1 cursor-grab"
      >
        <GripVertical size={14} />
      </button>
      <button
        onClick={onRemove}
        className="absolute top-1 right-1 bg-bg/80 p-1 hover:bg-state-error hover:text-white transition-colors opacity-0 group-hover:opacity-100"
      >
        <X size={14} />
      </button>
    </div>
  )
}

interface Props {
  project?: Project
}

export default function ProjectEditor({ project }: Props) {
  const router = useRouter()
  const qc = useQueryClient()
  const coverInputRef = useRef<HTMLInputElement>(null)
  const galleryInputRef = useRef<HTMLInputElement>(null)

  const [coverUpload, setCoverUpload] = useState<GalleryUpload | null>(
    project?.coverUrl ? { url: project.coverUrl, publicId: project.coverPublicId ?? '' } : null
  )
  const [coverUploading, setCoverUploading] = useState(false)
  const [gallery, setGallery] = useState<GalleryUpload[]>(
    project?.gallery?.map((g) => ({ url: g.url, publicId: g.publicId })) ?? []
  )
  const [galleryUploading, setGalleryUploading] = useState(false)
  const [description, setDescription] = useState(project?.description ?? '')

  const { register, handleSubmit, setValue, watch, control, formState: { errors, isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      title: project?.title ?? '',
      slug: project?.slug ?? '',
      tagline: project?.tagline ?? '',
      techStack: project?.techStack?.join(', ') ?? '',
      links: project?.links ?? [],
    },
  })

  const { fields: linkFields, append: appendLink, remove: removeLink } = useFieldArray({
    control,
    name: 'links',
  })

  const title = watch('title')
  const autoSlug = (t: string) => t.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')

  const getSign = useCallback((type: 'cover' | 'gallery', resourceId?: string) =>
    apiPost<UploadSignature>('/upload/sign', { type, resourceId }), [])

  const uploadCover = async (file: File) => {
    setCoverUploading(true)
    try {
      const sig = await getSign('cover', project?._id)
      const result = await uploadToCloudinary(file, sig)
      setCoverUpload(result)
    } catch {
      toast.error('Cover upload failed.')
    } finally {
      setCoverUploading(false)
    }
  }

  const uploadGalleryImages = async (files: FileList) => {
    if (gallery.length + files.length > 12) {
      toast.error('Maximum 12 gallery images.')
      return
    }
    setGalleryUploading(true)
    try {
      const sig = await getSign('gallery', project?._id)
      const results = await Promise.all(Array.from(files).map((f) => uploadToCloudinary(f, sig)))
      setGallery((prev) => [...prev, ...results])
    } catch {
      toast.error('Gallery upload failed.')
    } finally {
      setGalleryUploading(false)
    }
  }

  const sensors = useSensors(useSensor(PointerSensor))

  const onGalleryDragEnd = (e: DragEndEvent) => {
    const { active, over } = e
    if (!over || active.id === over.id) return
    setGallery((prev) => {
      const oldIdx = prev.findIndex((g) => g.url === active.id)
      const newIdx = prev.findIndex((g) => g.url === over.id)
      return arrayMove(prev, oldIdx, newIdx)
    })
  }

  const buildPayload = (data: FormData, isPublished?: boolean) => ({
    title: data.title,
    slug: data.slug,
    tagline: data.tagline || undefined,
    description,
    techStack: data.techStack ? data.techStack.split(',').map((t) => t.trim()).filter(Boolean) : [],
    links: data.links ?? [],
    coverUrl: coverUpload?.url ?? null,
    coverPublicId: coverUpload?.publicId ?? null,
    gallery: gallery.map((g, order) => ({ url: g.url, publicId: g.publicId, type: 'image', caption: null, order })),
    ...(isPublished !== undefined && { isPublished }),
  })

  const save = useMutation({
    mutationFn: (data: FormData) => {
      const payload = buildPayload(data)
      return project ? apiPatch(`/projects/${project._id}`, payload) : apiPost('/projects', payload)
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['projects', 'me'] })
      toast.success(project ? 'Project saved.' : 'Project created.')
      router.push('/dashboard/projects')
    },
    onError: () => toast.error('Failed to save.'),
  })

  const publish = useMutation({
    mutationFn: (data: FormData) => {
      const payload = buildPayload(data, true)
      return project ? apiPatch(`/projects/${project._id}`, payload) : apiPost('/projects', payload)
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['projects', 'me'] })
      toast.success('Published.')
      router.push('/dashboard/projects')
    },
    onError: () => toast.error('Failed to publish.'),
  })

  return (
    <>
      <DashboardTopbar title={project ? 'Edit Project' : 'New Project'} />
      <div className="flex-1 overflow-auto">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] min-h-full">
          {/* Form */}
          <div className="px-6 md:px-8 py-10 border-r border-line">
            <form onSubmit={handleSubmit((d) => save.mutate(d))} className="space-y-8 max-w-[640px]">
              {/* Cover */}
              <div>
                <p className="text-overline text-ink-muted mb-3">COVER IMAGE</p>
                {coverUpload ? (
                  <div className="relative aspect-video mb-3 border border-line overflow-hidden">
                    <Image src={coverUpload.url} alt="Cover" fill sizes="(max-width: 1024px) 100vw, 640px" className="object-cover" />
                    <button
                      type="button"
                      onClick={() => setCoverUpload(null)}
                      className="absolute top-2 right-2 bg-bg/90 p-1.5 hover:bg-state-error hover:text-white transition-colors"
                    >
                      <X size={14} />
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => coverInputRef.current?.click()}
                    disabled={coverUploading}
                    className="w-full aspect-video border-2 border-dashed border-line hover:border-ink transition-colors flex flex-col items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                  >
                    <Upload size={20} className="text-ink-muted" />
                    <p className="text-caption text-ink-muted">{coverUploading ? 'Uploading...' : 'Click to upload cover'}</p>
                  </button>
                )}
                <input
                  ref={coverInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => { const f = e.target.files?.[0]; if (f) uploadCover(f) }}
                />
              </div>

              {/* Title */}
              <div>
                <label className="text-overline text-ink-muted block mb-2">TITLE</label>
                <input
                  {...register('title', {
                    onChange: (e) => { if (!project) setValue('slug', autoSlug(e.target.value)) },
                  })}
                  className="w-full border-b border-line bg-transparent text-body text-ink pb-2 focus:outline-none focus:border-ink"
                  placeholder="My Project"
                />
                {errors.title && <p className="text-caption text-state-error mt-1">{errors.title.message}</p>}
              </div>

              {/* Slug */}
              <div>
                <label className="text-overline text-ink-muted block mb-2">SLUG</label>
                <input
                  {...register('slug')}
                  className="w-full border-b border-line bg-transparent text-caption text-ink-muted pb-2 focus:outline-none focus:border-ink font-mono"
                />
                {errors.slug && <p className="text-caption text-state-error mt-1">{errors.slug.message}</p>}
              </div>

              {/* Tagline */}
              <div>
                <label className="text-overline text-ink-muted block mb-2">TAGLINE</label>
                <input
                  {...register('tagline')}
                  placeholder="One-line description"
                  className="w-full border-b border-line bg-transparent text-body text-ink pb-2 focus:outline-none focus:border-ink"
                />
              </div>

              {/* Description */}
              <div>
                <label className="text-overline text-ink-muted block mb-2">DESCRIPTION</label>
                <div data-color-mode="light">
                  <MDEditor value={description} onChange={(v) => setDescription(v ?? '')} preview="edit" height={300} />
                </div>
              </div>

              {/* Tech Stack */}
              <div>
                <label className="text-overline text-ink-muted block mb-2">TECH STACK (COMMA-SEPARATED)</label>
                <input
                  {...register('techStack')}
                  placeholder="React, Node.js, Figma"
                  className="w-full border-b border-line bg-transparent text-body text-ink pb-2 focus:outline-none focus:border-ink"
                />
              </div>

              {/* Links */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <label className="text-overline text-ink-muted">PROJECT LINKS</label>
                  {linkFields.length < 6 && (
                    <button
                      type="button"
                      onClick={() => appendLink({ label: '', url: '', type: 'live' })}
                      className="text-caption text-ink-muted hover:text-ink flex items-center gap-1"
                    >
                      <Plus size={12} /> Add link
                    </button>
                  )}
                </div>
                <div className="space-y-3">
                  {linkFields.map((field, i) => (
                    <div key={field.id} className="flex gap-2 items-start">
                      <Controller
                        name={`links.${i}.type`}
                        control={control}
                        render={({ field: f }) => (
                          <AppSelect
                            options={LINK_TYPES.map((t) => ({ value: t, label: t }))}
                            value={f.value ?? 'live'}
                            onChange={f.onChange}
                            className="shrink-0 w-28"
                          />
                        )}
                      />
                      <input
                        {...register(`links.${i}.label`)}
                        placeholder="Label"
                        className="flex-1 border-b border-line bg-transparent text-caption text-ink pb-1.5 focus:outline-none focus:border-ink"
                      />
                      <input
                        {...register(`links.${i}.url`)}
                        placeholder="https://..."
                        className="flex-[2] border-b border-line bg-transparent text-caption text-ink pb-1.5 focus:outline-none focus:border-ink"
                      />
                      <button type="button" onClick={() => removeLink(i)} className="p-1 hover:text-state-error transition-colors mt-0.5">
                        <X size={14} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Gallery */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <label className="text-overline text-ink-muted">GALLERY ({gallery.length}/12)</label>
                  {gallery.length < 12 && (
                    <button
                      type="button"
                      onClick={() => galleryInputRef.current?.click()}
                      disabled={galleryUploading}
                      className="text-caption text-ink-muted hover:text-ink flex items-center gap-1 disabled:opacity-50"
                    >
                      <Upload size={12} /> {galleryUploading ? 'Uploading...' : 'Add images'}
                    </button>
                  )}
                </div>
                <input
                  ref={galleryInputRef}
                  type="file"
                  accept="image/*"
                  multiple
                  className="hidden"
                  onChange={(e) => { if (e.target.files) uploadGalleryImages(e.target.files) }}
                />
                {gallery.length > 0 && (
                  <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={onGalleryDragEnd}>
                    <SortableContext items={gallery.map((g) => g.url)} strategy={verticalListSortingStrategy}>
                      <div className="grid grid-cols-4 gap-2">
                        {gallery.map((g) => (
                          <SortableGalleryItem
                            key={g.url}
                            id={g.url}
                            url={g.url}
                            onRemove={() => setGallery((prev) => prev.filter((x) => x.url !== g.url))}
                          />
                        ))}
                      </div>
                    </SortableContext>
                  </DndContext>
                )}
              </div>

              {/* Actions */}
              <div className="flex gap-3 pt-4 border-t border-line">
                <button
                  type="submit"
                  disabled={isSubmitting || save.isPending}
                  className="bg-bg text-ink text-overline border border-ink px-6 py-2.5 hover:bg-bg-sunken transition-colors disabled:opacity-50"
                >
                  {save.isPending ? 'SAVING...' : 'SAVE DRAFT'}
                </button>
                <button
                  type="button"
                  disabled={publish.isPending}
                  onClick={handleSubmit((d) => publish.mutate(d))}
                  className="bg-ink text-bg text-overline px-6 py-2.5 hover:bg-ink-soft transition-colors disabled:opacity-50"
                >
                  {publish.isPending ? 'PUBLISHING...' : 'PUBLISH →'}
                </button>
                <button
                  type="button"
                  onClick={() => router.push('/dashboard/projects')}
                  className="text-caption text-ink-muted hover:text-ink transition-colors ml-auto"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>

          {/* Preview */}
          <div className="px-6 py-10 bg-bg-sunken hidden lg:block">
            <p className="text-overline text-ink-muted mb-6">PREVIEW</p>
            <div className="border border-line bg-bg">
              {coverUpload ? (
                <div className="aspect-video relative overflow-hidden">
                  <Image src={coverUpload.url} alt="" fill sizes="360px" className="object-cover" />
                </div>
              ) : (
                <div className="aspect-video bg-bg-elevated flex items-center justify-center">
                  <p className="text-overline text-ink-faint">NO COVER</p>
                </div>
              )}
              <div className="p-4">
                <p className="text-h6 font-bold text-ink">{title || 'Project Title'}</p>
                {description && (
                  <p className="text-caption text-ink-muted mt-2 line-clamp-3">{description.replace(/[#*`]/g, '')}</p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
