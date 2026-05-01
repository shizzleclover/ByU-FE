'use client'

import { useRef } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Upload, Trash2, ExternalLink } from 'lucide-react'
import { toast } from 'sonner'
import { DashboardTopbar } from '@/components/layout/DashboardTopbar'
import { api, apiDelete, apiGet } from '@/lib/api'
import type { ResumeFile } from '@/types/api'

export default function ResumePage() {
  const qc = useQueryClient()
  const inputRef = useRef<HTMLInputElement>(null)

  const { data: resume } = useQuery({
    queryKey: ['resume', 'me'],
    queryFn: () => apiGet<ResumeFile | null>('/resume').catch(() => null),
  })

  const upload = useMutation({
    mutationFn: async (file: File) => {
      const fd = new FormData()
      fd.append('resume', file)
      await api.post('/resume', fd, { headers: { 'Content-Type': 'multipart/form-data' } })
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['resume', 'me'] }); toast.success('Resume uploaded.') },
    onError: () => toast.error('Upload failed. Max 5MB PDF only.'),
  })

  const remove = useMutation({
    mutationFn: () => apiDelete('/resume'),
    onSuccess: () => { qc.setQueryData(['resume', 'me'], null); toast.success('Resume removed.') },
  })

  const onFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0]
    if (!f) return
    if (f.type !== 'application/pdf') { toast.error('PDF files only.'); return }
    if (f.size > 5 * 1024 * 1024) { toast.error('Max 5MB.'); return }
    upload.mutate(f)
  }

  return (
    <>
      <DashboardTopbar title="Resume" />
      <div className="flex-1 px-6 md:px-8 py-10 max-w-[560px] overflow-auto">
        {resume ? (
          <div className="border border-line p-6">
            <p className="text-overline text-ink-muted mb-4">CURRENT RESUME</p>
            <p className="text-h6 font-bold text-ink">{resume.filename}</p>
            <p className="text-caption text-ink-muted mt-1">
              {(resume.size / 1024).toFixed(0)} KB · Uploaded {new Date(resume.createdAt).toLocaleDateString()}
            </p>
            <div className="flex gap-3 mt-6">
              <a
                href={resume.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-overline border border-line px-4 py-2 hover:border-ink transition-colors"
              >
                VIEW <ExternalLink size={11} />
              </a>
              <button
                onClick={() => inputRef.current?.click()}
                className="text-overline border border-line px-4 py-2 hover:border-ink transition-colors"
                disabled={upload.isPending}
              >
                REPLACE
              </button>
              <button
                onClick={() => remove.mutate()}
                className="text-overline border border-line px-4 py-2 hover:border-state-error hover:text-state-error transition-colors"
                disabled={remove.isPending}
              >
                <Trash2 size={13} />
              </button>
            </div>
          </div>
        ) : (
          <div
            onClick={() => inputRef.current?.click()}
            className="border-2 border-dashed border-line hover:border-ink transition-colors p-16 text-center cursor-pointer"
          >
            <Upload size={24} className="mx-auto text-ink-muted mb-4" />
            <p className="text-h6 font-bold text-ink">Drop your resume PDF here</p>
            <p className="text-caption text-ink-muted mt-2">or click to browse · max 5MB</p>
          </div>
        )}

        <input
          ref={inputRef}
          type="file"
          accept="application/pdf"
          className="hidden"
          onChange={onFile}
        />

        {upload.isPending && (
          <p className="text-caption text-ink-muted mt-4 animate-pulse">Uploading...</p>
        )}
      </div>
    </>
  )
}
