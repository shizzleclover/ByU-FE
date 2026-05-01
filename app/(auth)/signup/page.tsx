'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { useQuery } from '@tanstack/react-query'
import { Eye, EyeOff, AlertCircle } from 'lucide-react'
import { apiPost, apiGet } from '@/lib/api'
import { useDebouncedValue } from '@/hooks/useDebouncedValue'

const schema = z.object({
  fullName: z.string().min(2, 'At least 2 characters').max(100),
  email: z.string().email('Enter a valid email'),
  username: z
    .string()
    .min(3, 'At least 3 characters')
    .max(24, 'Max 24 characters')
    .regex(/^[a-z0-9_-]+$/, 'Lowercase letters, numbers, _ and - only')
    .refine((v) => !v.startsWith('-') && !v.endsWith('-'), 'Cannot start or end with a hyphen'),
  password: z
    .string()
    .min(8, 'At least 8 characters')
    .regex(/[a-zA-Z]/, 'Must contain at least one letter')
    .regex(/[0-9]/, 'Must contain at least one number'),
})

type FormData = z.infer<typeof schema>

function FieldError({ message }: { message?: string }) {
  if (!message) return null
  return (
    <p className="flex items-center gap-1.5 text-caption text-state-error mt-1.5">
      <AlertCircle size={12} className="shrink-0" />
      {message}
    </p>
  )
}

export default function SignUpPage() {
  const router = useRouter()
  const [showPassword, setShowPassword] = useState(false)
  const [serverError, setServerError] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({ resolver: zodResolver(schema) })

  const usernameValue = watch('username') ?? ''
  const debouncedUsername = useDebouncedValue(usernameValue, 400)

  const { data: availability } = useQuery({
    queryKey: ['username-check', debouncedUsername],
    queryFn: () =>
      apiGet<{ available: boolean }>(`/profile/check-username?username=${debouncedUsername}`),
    enabled: debouncedUsername.length >= 3 && !errors.username,
    staleTime: 30_000,
  })

  const onSubmit = async (data: FormData) => {
    setServerError(null)
    try {
      await apiPost('/auth/signup', data)
      sessionStorage.setItem('pending_email', data.email)
      toast.success('Account created! Check your email for a verification code.')
      router.push(`/verify-email?email=${encodeURIComponent(data.email)}`)
    } catch (err: any) {
      const msg: string =
        err?.response?.data?.error?.message ??
        err?.response?.data?.message ??
        'Sign up failed. Please try again.'

      // Map known server messages to user-friendly text
      const friendly =
        msg.includes('Email already in use') ? 'An account with this email already exists.' :
        msg.includes('Username already taken') ? 'That username is already taken — try another.' :
        msg.includes('duplicate key') ? 'An account with this email already exists.' :
        msg

      setServerError(friendly)
    }
  }

  const usernameOk = debouncedUsername.length >= 3 && !errors.username && availability?.available === true
  const usernameTaken = debouncedUsername.length >= 3 && !errors.username && availability?.available === false

  return (
    <>
      <h1 className="text-h3 font-bold text-ink mb-2">SIGN UP.</h1>
      <p className="text-caption text-ink-muted mb-10">Create your canvas on ByU Connect.</p>

      {/* Server-level error banner */}
      {serverError && (
        <div className="flex items-start gap-3 bg-state-error/10 border border-state-error/30 px-4 py-3 mb-8">
          <AlertCircle size={16} className="text-state-error shrink-0 mt-0.5" />
          <p className="text-caption text-state-error">{serverError}</p>
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-8" noValidate>
        <div>
          <label className="text-overline text-ink-muted block mb-3">FULL NAME</label>
          <input
            {...register('fullName')}
            type="text"
            placeholder="Ada Lovelace"
            autoComplete="name"
            className="w-full border-b border-line bg-transparent text-body text-ink placeholder:text-ink-faint pb-2 focus:outline-none focus:border-ink transition-colors"
          />
          <FieldError message={errors.fullName?.message} />
        </div>

        <div>
          <label className="text-overline text-ink-muted block mb-3">EMAIL ADDRESS</label>
          <input
            {...register('email')}
            type="email"
            placeholder="you@email.com"
            autoComplete="email"
            className="w-full border-b border-line bg-transparent text-body text-ink placeholder:text-ink-faint pb-2 focus:outline-none focus:border-ink transition-colors"
          />
          <FieldError message={errors.email?.message} />
        </div>

        <div>
          <label className="text-overline text-ink-muted block mb-3">USERNAME</label>
          <input
            {...register('username')}
            type="text"
            placeholder="ada_lovelace"
            autoComplete="username"
            className="w-full border-b border-line bg-transparent text-body text-ink placeholder:text-ink-faint pb-2 focus:outline-none focus:border-ink transition-colors"
          />
          <p className="text-caption text-ink-faint mt-1">
            3–24 chars · lowercase letters, numbers, _ and - only
          </p>
          <FieldError message={errors.username?.message} />
          {!errors.username && usernameOk && (
            <p className="text-caption text-state-success mt-1">✓ Available</p>
          )}
          {!errors.username && usernameTaken && (
            <p className="flex items-center gap-1.5 text-caption text-state-error mt-1">
              <AlertCircle size={12} className="shrink-0" />
              Username already taken
            </p>
          )}
        </div>

        <div>
          <label className="text-overline text-ink-muted block mb-3">PASSWORD</label>
          <div className="relative">
            <input
              {...register('password')}
              type={showPassword ? 'text' : 'password'}
              placeholder="Min 8 chars, letter + number"
              autoComplete="new-password"
              className="w-full border-b border-line bg-transparent text-body text-ink placeholder:text-ink-faint pb-2 pr-8 focus:outline-none focus:border-ink transition-colors"
            />
            <button
              type="button"
              onClick={() => setShowPassword((v) => !v)}
              className="absolute right-0 bottom-2.5 text-ink-muted hover:text-ink transition-colors"
              tabIndex={-1}
            >
              {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
          <FieldError message={errors.password?.message} />
        </div>

        <button
          type="submit"
          disabled={isSubmitting || usernameTaken}
          className="w-full bg-ink text-bg text-overline py-4 hover:bg-ink-soft transition-colors disabled:opacity-50"
        >
          {isSubmitting ? 'CREATING...' : 'CREATE CANVAS →'}
        </button>
      </form>

      <p className="text-caption text-ink-muted text-center mt-8">
        Already have an account?{' '}
        <Link href="/signin" className="text-ink underline underline-offset-2">Sign in</Link>
      </p>
    </>
  )
}
