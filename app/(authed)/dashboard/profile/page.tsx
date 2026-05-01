'use client'

import { useEffect } from 'react'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { DashboardTopbar } from '@/components/layout/DashboardTopbar'
import { AppSelect } from '@/components/ui/AppSelect'
import { apiGet, apiPatch, api } from '@/lib/api'
import type { Profile } from '@/types/api'

const schema = z.object({
  fullName: z.string().min(1).max(80),
  bio: z.string().max(280).optional(),
  department: z.string().optional(),
  year: z.coerce.number().min(1).max(7).optional(),
  accentColor: z
    .string()
    .regex(/^#[0-9A-Fa-f]{6}$/, 'Enter a valid hex color e.g. #FF5500')
    .optional()
    .or(z.literal('')),
  isPublic: z.boolean(),
})

type FormData = z.infer<typeof schema>

export default function ProfilePage() {
  const qc = useQueryClient()

  const { data: profile } = useQuery({
    queryKey: ['profile', 'me'],
    queryFn: () => apiGet<Profile>('/profile/me'),
  })

  const { register, handleSubmit, reset, watch, control, formState: { errors, isDirty, isSubmitting } } =
    useForm<FormData>({ resolver: zodResolver(schema) })

  useEffect(() => {
    if (profile) {
      reset({
        fullName: profile.fullName,
        bio: profile.bio ?? '',
        department: profile.department ?? '',
        year: profile.year,
        accentColor: profile.accentColor ?? '',
        isPublic: profile.isPublic,
      })
    }
  }, [profile, reset])

  const bioValue = watch('bio') ?? ''

  const save = useMutation({
    mutationFn: (data: FormData) => apiPatch('/profile/me', {
      ...data,
      accentColor: data.accentColor || null,
      year: data.year || null,
    }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['profile', 'me'] })
      toast.success('Profile saved.')
    },
    onError: () => toast.error('Failed to save. Try again.'),
  })

  const uploadAvatar = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const fd = new FormData()
    fd.append('avatar', file)
    try {
      await api.post('/profile/me/avatar', fd, { headers: { 'Content-Type': 'multipart/form-data' } })
      qc.invalidateQueries({ queryKey: ['profile', 'me'] })
      toast.success('Avatar updated.')
    } catch {
      toast.error('Avatar upload failed.')
    }
  }

  const deleteAvatar = async () => {
    try {
      await api.delete('/profile/me/avatar')
      qc.invalidateQueries({ queryKey: ['profile', 'me'] })
      toast.success('Avatar removed.')
    } catch {
      toast.error('Could not remove avatar.')
    }
  }

  return (
    <>
      <DashboardTopbar title="Profile" />
      <div className="flex-1 px-6 md:px-8 py-10 max-w-[720px] overflow-auto">
        {/* Avatar */}
        <div className="mb-10">
          <p className="text-overline text-ink-muted mb-4">PHOTO</p>
          <div className="flex items-center gap-6">
            <div className="w-20 h-20 bg-bg-sunken overflow-hidden shrink-0">
              {profile?.avatar && (
                <img src={profile.avatar} alt="Avatar" className="w-full h-full object-cover" />
              )}
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-caption text-ink cursor-pointer hover:text-ink-soft transition-colors underline underline-offset-2">
                Change photo
                <input type="file" accept="image/*" className="hidden" onChange={uploadAvatar} />
              </label>
              {profile?.avatar && (
                <button
                  onClick={deleteAvatar}
                  className="text-caption text-state-error text-left hover:opacity-70 transition-opacity"
                >
                  Remove
                </button>
              )}
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit((d) => save.mutate(d))} className="space-y-8">
          <div>
            <label className="text-overline text-ink-muted block mb-3">FULL NAME</label>
            <input
              {...register('fullName')}
              className="w-full border-b border-line bg-transparent text-body text-ink pb-2 focus:outline-none focus:border-ink transition-colors"
            />
            {errors.fullName && <p className="text-caption text-state-error mt-1">{errors.fullName.message}</p>}
          </div>

          <div>
            <label className="text-overline text-ink-muted block mb-3">
              BIO <span className="text-ink-faint">{bioValue.length}/280</span>
            </label>
            <textarea
              {...register('bio')}
              rows={4}
              maxLength={280}
              className="w-full border-b border-line bg-transparent text-body text-ink pb-2 focus:outline-none focus:border-ink transition-colors resize-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-6">
            <div>
              <label className="text-overline text-ink-muted block mb-3">DEPARTMENT</label>
              <input
                {...register('department')}
                className="w-full border-b border-line bg-transparent text-body text-ink pb-2 focus:outline-none focus:border-ink transition-colors"
              />
            </div>
            <div>
              <label className="text-overline text-ink-muted block mb-3">YEAR</label>
              <Controller
                name="year"
                control={control}
                render={({ field }) => (
                  <AppSelect
                    variant="form"
                    options={[1,2,3,4,5,6,7].map((y) => ({ value: String(y), label: `Year ${y}` }))}
                    value={field.value ? String(field.value) : ''}
                    onChange={(v) => field.onChange(v ? Number(v) : undefined)}
                    placeholder="Select year"
                  />
                )}
              />
            </div>
          </div>

          <div>
            <label className="text-overline text-ink-muted block mb-3">ACCENT COLOR</label>
            <input
              {...register('accentColor')}
              placeholder="#0F0F0E"
              className="w-full border-b border-line bg-transparent text-body text-ink pb-2 focus:outline-none focus:border-ink transition-colors"
            />
            {errors.accentColor && <p className="text-caption text-state-error mt-1">{errors.accentColor.message}</p>}
          </div>

          <label className="flex items-center gap-3 cursor-pointer">
            <input {...register('isPublic')} type="checkbox" className="accent-ink" />
            <span className="text-caption text-ink">Public canvas (visible to anyone)</span>
          </label>

          <div className="pt-4">
            <button
              type="submit"
              disabled={!isDirty || isSubmitting}
              className="bg-ink text-bg text-overline px-8 py-3 hover:bg-ink-soft transition-colors disabled:opacity-40"
            >
              {isSubmitting ? 'SAVING...' : 'SAVE CHANGES →'}
            </button>
          </div>
        </form>
      </div>
    </>
  )
}
