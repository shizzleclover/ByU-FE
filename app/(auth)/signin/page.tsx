'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { toast } from 'sonner'
import { Eye, EyeOff } from 'lucide-react'
import { apiPost, setAccessToken } from '@/lib/api'
import { useQueryClient } from '@tanstack/react-query'
import { AUTH_KEY } from '@/hooks/useAuth'
import type { AuthResponse } from '@/types/api'

const schema = z.object({
  email: z.string().email(),
  password: z.string().min(1, 'Password is required'),
})

type FormData = z.infer<typeof schema>

export default function SignInPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const qc = useQueryClient()
  const redirect = searchParams.get('redirect') ?? '/dashboard'
  const [showPassword, setShowPassword] = useState(false)

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(schema),
  })

  const onSubmit = async (data: FormData) => {
    try {
      const res = await apiPost<AuthResponse>('/auth/signin', data)
      setAccessToken(res.accessToken)
      qc.setQueryData(AUTH_KEY, res.user)
      router.push(redirect)
    } catch (err: any) {
      toast.error(err?.response?.data?.error?.message ?? 'Sign in failed. Check your credentials.')
    }
  }

  return (
    <>
      <h1 className="text-h3 font-bold text-ink mb-2">SIGN IN.</h1>
      <p className="text-caption text-ink-muted mb-10">Access your ByU Connect canvas.</p>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-8" noValidate>
        <div>
          <label className="text-overline text-ink-muted block mb-3">EMAIL ADDRESS</label>
          <input
            {...register('email')}
            type="email"
            placeholder="you@email.com"
            className="w-full border-b border-line bg-transparent text-body text-ink placeholder:text-ink-faint pb-2 focus:outline-none focus:border-ink transition-colors"
          />
          {errors.email && <p className="text-caption text-state-error mt-1">{errors.email.message}</p>}
        </div>

        <div>
          <label className="text-overline text-ink-muted block mb-3">PASSWORD</label>
          <div className="relative">
            <input
              {...register('password')}
              type={showPassword ? 'text' : 'password'}
              placeholder="••••••••"
              autoComplete="current-password"
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
          {errors.password && <p className="text-caption text-state-error mt-1">{errors.password.message}</p>}
        </div>

        <div className="flex justify-end">
          <Link href="/forgot-password" className="text-caption text-ink-muted hover:text-ink transition-colors">
            Forgot password?
          </Link>
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full bg-ink text-bg text-overline py-4 hover:bg-ink-soft transition-colors disabled:opacity-50"
        >
          {isSubmitting ? 'SIGNING IN...' : 'SIGN IN →'}
        </button>
      </form>

      <p className="text-caption text-ink-muted text-center mt-8">
        No account?{' '}
        <Link href="/signup" className="text-ink underline underline-offset-2">
          Sign up
        </Link>
      </p>
    </>
  )
}
