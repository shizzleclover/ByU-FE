'use client'

import { useState } from 'react'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Plus, Pencil, Trash2, Star } from 'lucide-react'
import { toast } from 'sonner'
import { DashboardTopbar } from '@/components/layout/DashboardTopbar'
import { AppSelect } from '@/components/ui/AppSelect'
import { apiGet, apiPost, apiPatch, apiDelete } from '@/lib/api'
import type { Contact } from '@/types/api'

const TYPES = ['whatsapp','instagram','twitter','email','phone','linkedin','tiktok','website','custom']

const schema = z.object({
  type: z.string().min(1),
  label: z.string().max(40).optional(),
  value: z.string().min(1, 'Value is required'),
})

type FormData = z.infer<typeof schema>

export default function ContactsPage() {
  const qc = useQueryClient()
  const [editing, setEditing] = useState<Contact | null>(null)
  const [showForm, setShowForm] = useState(false)

  const { data: contacts = [] } = useQuery({
    queryKey: ['contacts', 'me'],
    queryFn: () => apiGet<Contact[]>('/contacts'),
  })

  const { register, handleSubmit, reset, control, formState: { isSubmitting } } = useForm<FormData>({ resolver: zodResolver(schema) })

  const openAdd = () => { setEditing(null); reset({}); setShowForm(true) }
  const openEdit = (c: Contact) => { setEditing(c); reset({ type: c.type, label: c.label ?? '', value: c.value }); setShowForm(true) }
  const close = () => { setShowForm(false); setEditing(null) }

  const save = useMutation({
    mutationFn: (d: FormData) => editing ? apiPatch(`/contacts/${editing._id}`, d) : apiPost('/contacts', d),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['contacts', 'me'] }); toast.success(editing ? 'Updated.' : 'Added.'); close() },
    onError: () => toast.error('Failed to save.'),
  })

  const remove = useMutation({
    mutationFn: (id: string) => apiDelete(`/contacts/${id}`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['contacts', 'me'] }),
  })

  const setPrimary = useMutation({
    mutationFn: (id: string) => apiPatch(`/contacts/${id}/primary`, {}),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['contacts', 'me'] }),
  })

  return (
    <>
      <DashboardTopbar title="Contacts" />
      <div className="flex-1 px-6 md:px-8 py-10 max-w-[700px] overflow-auto">
        <div className="flex items-center justify-between mb-8">
          <p className="text-caption text-ink-muted">{contacts.length}/8 contacts</p>
          {contacts.length < 8 && (
            <button onClick={openAdd} className="flex items-center gap-2 text-overline bg-ink text-bg px-4 py-2 hover:bg-ink-soft transition-colors">
              <Plus size={14} /> ADD CONTACT
            </button>
          )}
        </div>

        {showForm && (
          <div className="border border-line p-6 mb-8">
            <form onSubmit={handleSubmit((d) => save.mutate(d))} className="space-y-6">
              <div>
                <label className="text-overline text-ink-muted block mb-2">TYPE</label>
                <Controller
                  name="type"
                  control={control}
                  render={({ field }) => (
                    <AppSelect
                      variant="form"
                      options={TYPES.map((t) => ({ value: t, label: t.charAt(0).toUpperCase() + t.slice(1) }))}
                      value={field.value ?? ''}
                      onChange={field.onChange}
                      placeholder="Select type"
                    />
                  )}
                />
              </div>
              <div>
                <label className="text-overline text-ink-muted block mb-2">VALUE</label>
                <input {...register('value')} placeholder="+2348000000000 / @username / url" className="w-full border-b border-line bg-transparent text-body text-ink pb-2 focus:outline-none focus:border-ink" />
              </div>
              <div>
                <label className="text-overline text-ink-muted block mb-2">LABEL (OPTIONAL)</label>
                <input {...register('label')} placeholder="e.g. Work WhatsApp" className="w-full border-b border-line bg-transparent text-body text-ink pb-2 focus:outline-none focus:border-ink" />
              </div>
              <div className="flex gap-3">
                <button type="submit" disabled={isSubmitting} className="bg-ink text-bg text-overline px-6 py-2.5 hover:bg-ink-soft transition-colors disabled:opacity-50">SAVE →</button>
                <button type="button" onClick={close} className="text-caption text-ink-muted hover:text-ink transition-colors">Cancel</button>
              </div>
            </form>
          </div>
        )}

        <div className="divide-y divide-line">
          {contacts.map((c) => (
            <div key={c._id} className="flex items-center justify-between py-4 gap-4">
              <div>
                <p className="text-overline text-ink-muted flex items-center gap-2">
                  {c.type}
                  {c.isPrimary && <span className="text-state-success">PRIMARY</span>}
                </p>
                <p className="text-meta text-ink mt-0.5">{c.label || c.value}</p>
              </div>
              <div className="flex gap-2 shrink-0">
                <button onClick={() => setPrimary.mutate(c._id)} className={`p-2 border transition-colors ${c.isPrimary ? 'border-ink text-ink' : 'border-line hover:border-ink'}`} title="Set as primary">
                  <Star size={13} fill={c.isPrimary ? 'currentColor' : 'none'} />
                </button>
                <button onClick={() => openEdit(c)} className="p-2 border border-line hover:border-ink transition-colors"><Pencil size={13} /></button>
                <button onClick={() => remove.mutate(c._id)} className="p-2 border border-line hover:border-state-error hover:text-state-error transition-colors"><Trash2 size={13} /></button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  )
}
