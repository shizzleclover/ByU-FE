'use client'

import { useState } from 'react'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useRouter } from 'next/navigation'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { AppSelect } from '@/components/ui/AppSelect'
import Stepper, { Step } from '@/components/ui/Stepper'
import { apiPatch } from '@/lib/api'
import { AUTH_KEY } from '@/hooks/useAuth'

const DEPARTMENTS = [
  'Accounting', 'Animation', 'Architecture', 'Business Management',
  'Chemical Engineering', 'Civil Engineering', 'Communications', 'Computer Science',
  'Design', 'Economics', 'Education', 'Electrical Engineering', 'English', 'Finance',
  'Food Science', 'Geography', 'Global Supply Chain', 'Graphic Design', 'History',
  'Information Systems', 'Journalism', 'Law', 'Marketing', 'Mathematics',
  'Mechanical Engineering', 'Media Arts', 'Music', 'Nursing', 'Philosophy',
  'Physics', 'Political Science', 'Psychology', 'Public Health', 'Social Work',
  'Sociology', 'Spanish', 'Statistics', 'Theatre Arts', 'Visual Arts', 'Other',
]

const DEPT_OPTIONS = DEPARTMENTS.map((d) => ({ value: d, label: d }))
const YEAR_OPTIONS = [
  { value: '1', label: 'Freshman (Year 1)' },
  { value: '2', label: 'Sophomore (Year 2)' },
  { value: '3', label: 'Junior (Year 3)' },
  { value: '4', label: 'Senior (Year 4)' },
  { value: '5', label: 'Year 5' },
  { value: '6', label: 'Year 6' },
  { value: '7', label: 'Year 7+' },
]

const schema = z.object({
  bio: z.string().max(280).optional(),
  department: z.string().optional(),
  year: z.coerce.number().min(1).max(7).optional(),
})

type FormData = z.infer<typeof schema>

export default function OnboardingPage() {
  const router = useRouter()
  const qc = useQueryClient()
  const [customDept, setCustomDept] = useState('')

  const { register, handleSubmit, watch, control } = useForm<FormData>({
    resolver: zodResolver(schema),
  })

  const bio = watch('bio') ?? ''
  const deptValue = watch('department') ?? ''
  const isOtherDept = deptValue === 'Other'

  const save = useMutation({
    mutationFn: (data: FormData) =>
      apiPatch('/profile/me', {
        bio: data.bio || null,
        department: isOtherDept ? (customDept.trim() || null) : (data.department || null),
        year: data.year || null,
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: AUTH_KEY })
      router.push('/dashboard')
    },
    onError: () => toast.error('Failed to save. You can update this in your dashboard.'),
  })

  return (
    <div className="w-full">
      <Stepper
        initialStep={1}
        disableStepIndicators
        backButtonText="← Back"
        nextButtonText="NEXT →"
        onFinalStepCompleted={handleSubmit((d) => save.mutate(d))}
        nextButtonProps={{ disabled: save.isPending }}
        footerClassName="border-t border-line pt-6 mt-8"
      >
        {/* ── Step 1 ── */}
        <Step>
          <div className="space-y-8 pb-2">
            <div>
              <p className="text-overline text-ink-muted mb-1">STEP 1 OF 2</p>
              <h1 className="text-h3 font-bold text-ink mb-1">TELL US ABOUT YOU.</h1>
              <p className="text-caption text-ink-muted">
                Helps recruiters and peers find you faster.
              </p>
            </div>

            {/* Bio */}
            <div>
              <label className="text-overline text-ink-muted block mb-3">
                BIO <span className="text-ink-faint">(OPTIONAL)</span>
              </label>
              <textarea
                {...register('bio')}
                rows={3}
                maxLength={280}
                placeholder="Designer who codes. BYU CS senior. Obsessed with type and motion."
                className="w-full border-b border-line bg-transparent text-body text-ink placeholder:text-ink-faint pb-2 focus:outline-none focus:border-ink transition-colors resize-none"
              />
              <p className="text-caption text-ink-faint mt-1 text-right">{bio.length}/280</p>
            </div>

            {/* Department */}
            <div>
              <label className="text-overline text-ink-muted block mb-3">
                DEPARTMENT <span className="text-ink-faint">(OPTIONAL)</span>
              </label>
              <Controller
                name="department"
                control={control}
                render={({ field }) => (
                  <AppSelect
                    variant="form"
                    options={DEPT_OPTIONS}
                    value={field.value ?? ''}
                    onChange={field.onChange}
                    placeholder="Select your department"
                  />
                )}
              />
              {isOtherDept && (
                <input
                  type="text"
                  value={customDept}
                  onChange={(e) => setCustomDept(e.target.value)}
                  placeholder="Type your department"
                  autoFocus
                  className="w-full mt-4 border-b border-line bg-transparent text-body text-ink placeholder:text-ink-faint pb-2 focus:outline-none focus:border-ink transition-colors"
                />
              )}
            </div>

            {/* Year */}
            <div>
              <label className="text-overline text-ink-muted block mb-3">
                YEAR <span className="text-ink-faint">(OPTIONAL)</span>
              </label>
              <Controller
                name="year"
                control={control}
                render={({ field }) => (
                  <AppSelect
                    variant="form"
                    options={YEAR_OPTIONS}
                    value={field.value ? String(field.value) : ''}
                    onChange={(v) => field.onChange(v ? Number(v) : undefined)}
                    placeholder="Select your year"
                  />
                )}
              />
            </div>
          </div>
        </Step>

        {/* ── Step 2 ── */}
        <Step>
          <div className="space-y-8 pb-2">
            <div>
              <p className="text-overline text-ink-muted mb-1">STEP 2 OF 2</p>
              <h1 className="text-h3 font-bold text-ink mb-1">YOUR CANVAS IS READY.</h1>
              <p className="text-caption text-ink-muted">
                Add content to bring it to life. Update everything anytime in your dashboard.
              </p>
            </div>

            <div className="space-y-3">
              {[
                { n: '01', label: 'Add your first project' },
                { n: '02', label: 'List the services you offer' },
                { n: '03', label: 'Add contact links' },
              ].map(({ n, label }) => (
                <div key={n} className="flex items-center gap-4 border border-line p-4">
                  <span className="text-overline text-ink-faint shrink-0">{n}</span>
                  <span className="text-meta text-ink">{label}</span>
                </div>
              ))}
            </div>

            {save.isPending && (
              <p className="text-caption text-ink-muted animate-pulse">Setting up your canvas...</p>
            )}
          </div>
        </Step>
      </Stepper>

      <p className="text-caption text-ink-faint text-center mt-6">
        <button
          onClick={() => router.push('/dashboard')}
          className="hover:text-ink-muted transition-colors"
        >
          Skip for now
        </button>
      </p>
    </div>
  )
}
