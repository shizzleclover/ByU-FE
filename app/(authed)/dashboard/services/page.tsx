'use client'

import { useState } from 'react'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Plus, Pencil, Trash2 } from 'lucide-react'
import { toast } from 'sonner'
import { DashboardTopbar } from '@/components/layout/DashboardTopbar'
import { Hairline } from '@/components/editorial/Hairline'
import { AppSelect } from '@/components/ui/AppSelect'
import { apiGet, apiPost, apiPatch, apiDelete } from '@/lib/api'
import type { Service } from '@/types/api'

const CATEGORIES = ['Design', 'Development', 'Writing', 'Photography', 'Video', 'Music', 'Tutoring', 'Marketing', 'Fashion', 'Crafts', 'Consulting', 'Other']

const schema = z.object({
  category: z.string().min(1),
  title: z.string().min(1).max(80),
  description: z.string().max(500).optional(),
  startingPrice: z.coerce.number().min(0).optional(),
  currency: z.string().default('NGN'),
  isNegotiable: z.boolean().default(false),
})

type FormData = z.infer<typeof schema>

export default function ServicesPage() {
  const qc = useQueryClient()
  const [editing, setEditing] = useState<Service | null>(null)
  const [showForm, setShowForm] = useState(false)

  const { data: services = [] } = useQuery({
    queryKey: ['services', 'me'],
    queryFn: () => apiGet<Service[]>('/services'),
  })

  const { register, handleSubmit, reset, control, formState: { errors, isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(schema),
  })

  const openAdd = () => { setEditing(null); reset({}); setShowForm(true) }
  const openEdit = (svc: Service) => {
    setEditing(svc)
    reset({ category: svc.category, title: svc.title, description: svc.description ?? '', startingPrice: svc.startingPrice, currency: svc.currency, isNegotiable: svc.isNegotiable })
    setShowForm(true)
  }
  const close = () => { setShowForm(false); setEditing(null) }

  const save = useMutation({
    mutationFn: (data: FormData) =>
      editing ? apiPatch(`/services/${editing._id}`, data) : apiPost('/services', data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['services', 'me'] }); toast.success(editing ? 'Service updated.' : 'Service added.'); close() },
    onError: () => toast.error('Failed to save.'),
  })

  const remove = useMutation({
    mutationFn: (id: string) => apiDelete(`/services/${id}`),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['services', 'me'] }); toast.success('Service removed.') },
  })

  return (
    <>
      <DashboardTopbar title="Services" />
      <div className="flex-1 px-6 md:px-8 py-10 overflow-auto">
        <div className="flex items-center justify-between mb-8">
          <p className="text-caption text-ink-muted">{services.length}/12 services</p>
          {services.length < 12 && (
            <button onClick={openAdd} className="flex items-center gap-2 text-overline bg-ink text-bg px-4 py-2 hover:bg-ink-soft transition-colors">
              <Plus size={14} /> ADD SERVICE
            </button>
          )}
        </div>

        {/* Form */}
        {showForm && (
          <div className="border border-line p-6 mb-8">
            <p className="text-overline text-ink-muted mb-6">{editing ? 'EDIT SERVICE' : 'NEW SERVICE'}</p>
            <form onSubmit={handleSubmit((d) => save.mutate(d))} className="space-y-6">
              <div>
                <label className="text-overline text-ink-muted block mb-2">CATEGORY</label>
                <Controller
                  name="category"
                  control={control}
                  render={({ field }) => (
                    <AppSelect
                      variant="form"
                      options={CATEGORIES.map((c) => ({ value: c, label: c }))}
                      value={field.value ?? ''}
                      onChange={field.onChange}
                      placeholder="Select category"
                    />
                  )}
                />
                {errors.category && <p className="text-caption text-state-error mt-1">{errors.category.message}</p>}
              </div>

              <div>
                <label className="text-overline text-ink-muted block mb-2">TITLE</label>
                <input {...register('title')} className="w-full border-b border-line bg-transparent text-body text-ink pb-2 focus:outline-none focus:border-ink" />
                {errors.title && <p className="text-caption text-state-error mt-1">{errors.title.message}</p>}
              </div>

              <div>
                <label className="text-overline text-ink-muted block mb-2">DESCRIPTION</label>
                <textarea {...register('description')} rows={3} className="w-full border-b border-line bg-transparent text-body text-ink pb-2 focus:outline-none focus:border-ink resize-none" />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-overline text-ink-muted block mb-2">STARTING PRICE</label>
                  <input {...register('startingPrice')} type="number" className="w-full border-b border-line bg-transparent text-body text-ink pb-2 focus:outline-none focus:border-ink" />
                </div>
                <div>
                  <label className="text-overline text-ink-muted block mb-2">CURRENCY</label>
                  <input {...register('currency')} defaultValue="NGN" className="w-full border-b border-line bg-transparent text-body text-ink pb-2 focus:outline-none focus:border-ink" />
                </div>
              </div>

              <label className="flex items-center gap-3 cursor-pointer">
                <input {...register('isNegotiable')} type="checkbox" className="accent-ink" />
                <span className="text-caption text-ink">Negotiable</span>
              </label>

              <div className="flex gap-3">
                <button type="submit" disabled={isSubmitting} className="bg-ink text-bg text-overline px-6 py-2.5 hover:bg-ink-soft transition-colors disabled:opacity-50">
                  {isSubmitting ? 'SAVING...' : 'SAVE →'}
                </button>
                <button type="button" onClick={close} className="text-caption text-ink-muted hover:text-ink transition-colors">Cancel</button>
              </div>
            </form>
          </div>
        )}

        {/* List */}
        <div className="divide-y divide-line">
          {services.length === 0 && !showForm && (
            <p className="text-caption text-ink-muted py-8 text-center">No services yet. Add your first one above.</p>
          )}
          {services.map((svc) => (
            <div key={svc._id} className="flex items-start justify-between py-5 gap-4">
              <div>
                <p className="text-overline text-ink-muted">{svc.category}</p>
                <p className="text-h6 font-bold text-ink mt-1">{svc.title}</p>
                {svc.description && <p className="text-caption text-ink-muted mt-1 line-clamp-2">{svc.description}</p>}
                <p className="text-overline text-ink-muted mt-2">
                  {svc.isNegotiable ? 'Negotiable' : svc.startingPrice ? `From ${svc.currency}${svc.startingPrice.toLocaleString()}` : 'Contact for pricing'}
                </p>
              </div>
              <div className="flex gap-2 shrink-0">
                <button onClick={() => openEdit(svc)} className="p-2 border border-line hover:border-ink transition-colors"><Pencil size={13} /></button>
                <button onClick={() => remove.mutate(svc._id)} className="p-2 border border-line hover:border-state-error hover:text-state-error transition-colors"><Trash2 size={13} /></button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  )
}
