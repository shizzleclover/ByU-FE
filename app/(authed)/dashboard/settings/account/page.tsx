'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useMutation } from '@tanstack/react-query'
import { toast } from 'sonner'
import { DashboardTopbar } from '@/components/layout/DashboardTopbar'
import { Hairline } from '@/components/editorial/Hairline'
import { apiPatch } from '@/lib/api'

const emailSchema = z.object({
  email: z.string().email('Must be a valid email'),
})

const passwordSchema = z.object({
  currentPassword: z.string().min(1, 'Current password is required'),
  newPassword: z.string().min(8, 'At least 8 characters'),
})

const usernameSchema = z.object({
  username: z.string().min(3).max(30).regex(/^[a-zA-Z0-9_]+$/, 'Letters, numbers, underscores only'),
})

type EmailForm = z.infer<typeof emailSchema>
type PasswordForm = z.infer<typeof passwordSchema>
type UsernameForm = z.infer<typeof usernameSchema>

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="py-8">
      <p className="text-overline text-ink-muted mb-6">{title}</p>
      {children}
    </div>
  )
}

export default function AccountSettingsPage() {
  const emailForm = useForm<EmailForm>({ resolver: zodResolver(emailSchema) })
  const passwordForm = useForm<PasswordForm>({ resolver: zodResolver(passwordSchema) })
  const usernameForm = useForm<UsernameForm>({ resolver: zodResolver(usernameSchema) })

  const changeEmail = useMutation({
    mutationFn: (d: EmailForm) => apiPatch('/auth/change-email', d),
    onSuccess: () => { toast.success('Email updated. Check your inbox to confirm.'); emailForm.reset() },
    onError: () => toast.error('Failed to update email.'),
  })

  const changePassword = useMutation({
    mutationFn: (d: PasswordForm) => apiPatch('/auth/change-password', d),
    onSuccess: () => { toast.success('Password updated.'); passwordForm.reset() },
    onError: (err: any) => toast.error(err?.response?.data?.message ?? 'Failed to update password.'),
  })

  const changeUsername = useMutation({
    mutationFn: (d: UsernameForm) => apiPatch('/auth/change-username', d),
    onSuccess: () => { toast.success('Username updated.'); usernameForm.reset() },
    onError: (err: any) => toast.error(err?.response?.data?.message ?? 'Failed to update username.'),
  })

  return (
    <>
      <DashboardTopbar title="Account Settings" />
      <div className="flex-1 px-6 md:px-8 overflow-auto max-w-[560px]">
        <Section title="EMAIL ADDRESS">
          <form onSubmit={emailForm.handleSubmit((d) => changeEmail.mutate(d))} className="space-y-5">
            <div>
              <input
                {...emailForm.register('email')}
                type="email"
                placeholder="new@email.com"
                className="w-full border-b border-line bg-transparent text-body text-ink pb-2 focus:outline-none focus:border-ink"
              />
              {emailForm.formState.errors.email && (
                <p className="text-caption text-state-error mt-1">{emailForm.formState.errors.email.message}</p>
              )}
            </div>
            <button
              type="submit"
              disabled={changeEmail.isPending}
              className="bg-ink text-bg text-overline px-6 py-2.5 hover:bg-ink-soft transition-colors disabled:opacity-50"
            >
              {changeEmail.isPending ? 'UPDATING...' : 'UPDATE EMAIL →'}
            </button>
          </form>
        </Section>

        <Hairline />

        <Section title="PASSWORD">
          <form onSubmit={passwordForm.handleSubmit((d) => changePassword.mutate(d))} className="space-y-5">
            <div>
              <label className="text-overline text-ink-muted block mb-2">CURRENT PASSWORD</label>
              <input
                {...passwordForm.register('currentPassword')}
                type="password"
                className="w-full border-b border-line bg-transparent text-body text-ink pb-2 focus:outline-none focus:border-ink"
              />
              {passwordForm.formState.errors.currentPassword && (
                <p className="text-caption text-state-error mt-1">{passwordForm.formState.errors.currentPassword.message}</p>
              )}
            </div>
            <div>
              <label className="text-overline text-ink-muted block mb-2">NEW PASSWORD</label>
              <input
                {...passwordForm.register('newPassword')}
                type="password"
                className="w-full border-b border-line bg-transparent text-body text-ink pb-2 focus:outline-none focus:border-ink"
              />
              {passwordForm.formState.errors.newPassword && (
                <p className="text-caption text-state-error mt-1">{passwordForm.formState.errors.newPassword.message}</p>
              )}
            </div>
            <button
              type="submit"
              disabled={changePassword.isPending}
              className="bg-ink text-bg text-overline px-6 py-2.5 hover:bg-ink-soft transition-colors disabled:opacity-50"
            >
              {changePassword.isPending ? 'UPDATING...' : 'UPDATE PASSWORD →'}
            </button>
          </form>
        </Section>

        <Hairline />

        <Section title="USERNAME">
          <p className="text-caption text-ink-muted mb-5">Username can only be changed once every 7 days.</p>
          <form onSubmit={usernameForm.handleSubmit((d) => changeUsername.mutate(d))} className="space-y-5">
            <div>
              <input
                {...usernameForm.register('username')}
                placeholder="new_username"
                className="w-full border-b border-line bg-transparent text-body text-ink pb-2 focus:outline-none focus:border-ink"
              />
              {usernameForm.formState.errors.username && (
                <p className="text-caption text-state-error mt-1">{usernameForm.formState.errors.username.message}</p>
              )}
            </div>
            <button
              type="submit"
              disabled={changeUsername.isPending}
              className="bg-ink text-bg text-overline px-6 py-2.5 hover:bg-ink-soft transition-colors disabled:opacity-50"
            >
              {changeUsername.isPending ? 'UPDATING...' : 'UPDATE USERNAME →'}
            </button>
          </form>
        </Section>
      </div>
    </>
  )
}
