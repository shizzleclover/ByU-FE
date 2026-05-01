'use client'

import { useState, useRef, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { Upload, X } from 'lucide-react'
import { toast } from 'sonner'
import Image from 'next/image'
import dynamic from 'next/dynamic'
import { DashboardTopbar } from '@/components/layout/DashboardTopbar'
import { apiPost, apiPatch } from '@/lib/api'
import type { Story, UploadSignature } from '@/types/api'

const MDEditor = dynamic(() => import('@uiw/react-md-editor'), { ssr: false })

const schema = z.object({
  title: z.string().min(1, 'Title is required').max(120),
  slug: z.string().min(1).max(120).regex(/^[a-z0-9-]+$/, 'Lowercase letters, numbers, hyphens only'),
  excerpt: z.string().max(200).optional(),
})

type FormData = z.infer<typeof schema>

async function uploadToCloudinary(file: File, sig: UploadSignature): Promise<{ url: string; publicId: string }> {
  const fd = new FormData()
  fd.append('file', file)
  fd.append('api_key', sig.apiKey)
  fd.append('timestamp', String(sig.timestamp))
  fd.append('signature', sig.signature)
  fd.append('folder', sig.folder)
  const res = await fetch(`https://api.cloudinary.com/v1_1/${sig.cloudName}/image/upload`, {
    method: 'POST',
    body: fd,
  })
  const data = await res.json()
  if (!data.secure_url) throw new Error('Upload failed')
  return { url: data.secure_url as string, publicId: data.public_id as string }
}

interface Props {
  story?: Story
}

export default function StoryEditor({ story }: Props) {
  const router = useRouter()
  const qc = useQueryClient()
  const coverInputRef = useRef<HTMLInputElement>(null)

  const [coverUpload, setCoverUpload] = useState<{ url: string; publicId: string } | null>(
    story?.coverUrl ? { url: story.coverUrl, publicId: story.coverPublicId ?? '' } : null
  )
  const [coverUploading, setCoverUploading] = useState(false)
  const [body, setBody] = useState(story?.body ?? '')

  const { register, handleSubmit, setValue, formState: { errors, isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      title: story?.title ?? '',
      slug: story?.slug ?? '',
      excerpt: story?.excerpt ?? '',
    },
  })

  const autoSlug = (t: string) => t.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')

  const getSign = useCallback(() => apiPost<UploadSignature>('/upload/sign', { type: 'story' }), [])

  const uploadCover = async (file: File) => {
    setCoverUploading(true)
    try {
      const sig = await getSign()
      const result = await uploadToCloudinary(file, sig)
      setCoverUpload(result)
    } catch {
      toast.error('Cover upload failed.')
    } finally {
      setCoverUploading(false)
    }
  }

  const buildPayload = (data: FormData, isPublished?: boolean) => ({
    title: data.title,
    slug: data.slug,
    excerpt: data.excerpt || null,
    body,
    coverUrl: coverUpload?.url ?? null,
    coverPublicId: coverUpload?.publicId ?? null,
    ...(isPublished !== undefined && { isPublished }),
  })

  const save = useMutation({
    mutationFn: (data: FormData) => {
      const payload = buildPayload(data)
      return story ? apiPatch(`/stories/${story._id}`, payload) : apiPost('/stories', payload)
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['stories', 'me'] })
      toast.success(story ? 'Story saved.' : 'Story created.')
      router.push('/dashboard/stories')
    },
    onError: () => toast.error('Failed to save.'),
  })

  const publish = useMutation({
    mutationFn: (data: FormData) => {
      const payload = buildPayload(data, true)
      return story ? apiPatch(`/stories/${story._id}`, payload) : apiPost('/stories', payload)
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['stories', 'me'] })
      toast.success('Published.')
      router.push('/dashboard/stories')
    },
    onError: () => toast.error('Failed to publish.'),
  })

  return (
    <>
      <DashboardTopbar title={story ? 'Edit Story' : 'New Story'} />
      <div className="flex-1 px-6 md:px-8 py-10 overflow-auto">
        <form onSubmit={handleSubmit((d) => save.mutate(d))} className="max-w-[800px] space-y-8">
          {/* Cover */}
          <div>
            <p className="text-overline text-ink-muted mb-3">COVER IMAGE</p>
            {coverUpload ? (
              <div className="relative aspect-[3/1] mb-3 border border-line overflow-hidden">
                <Image src={coverUpload.url} alt="Cover" fill sizes="(max-width: 1024px) 100vw, 800px" className="object-cover" />
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
                className="w-full aspect-[3/1] border-2 border-dashed border-line hover:border-ink transition-colors flex flex-col items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
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
                onChange: (e) => { if (!story) setValue('slug', autoSlug(e.target.value)) },
              })}
              placeholder="Story title"
              className="w-full border-b border-line bg-transparent text-h6 font-bold text-ink pb-2 focus:outline-none focus:border-ink"
            />
            {errors.title && <p className="text-caption text-state-error mt-1">{errors.title.message}</p>}
          </div>

          {/* Slug */}
          <div>
            <label className="text-overline text-ink-muted block mb-2">SLUG</label>
            <input
              {...register('slug')}
              className="w-full border-b border-line bg-transparent text-caption text-ink-muted pb-1.5 focus:outline-none focus:border-ink font-mono"
            />
            {errors.slug && <p className="text-caption text-state-error mt-1">{errors.slug.message}</p>}
          </div>

          {/* Excerpt */}
          <div>
            <label className="text-overline text-ink-muted block mb-2">EXCERPT (MAX 200 CHARS)</label>
            <input
              {...register('excerpt')}
              placeholder="A brief preview shown in discovery..."
              className="w-full border-b border-line bg-transparent text-body text-ink pb-2 focus:outline-none focus:border-ink"
            />
          </div>

          {/* Body */}
          <div>
            <label className="text-overline text-ink-muted block mb-3">CONTENT</label>
            <div data-color-mode="light">
              <MDEditor value={body} onChange={(v) => setBody(v ?? '')} preview="edit" height={500} />
            </div>
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
              onClick={() => router.push('/dashboard/stories')}
              className="text-caption text-ink-muted hover:text-ink transition-colors ml-auto"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </>
  )
}
