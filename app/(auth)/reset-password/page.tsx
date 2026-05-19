'use client'

import { Suspense } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useRouter, useSearchParams } from 'next/navigation'
import { toast } from 'sonner'
import { apiPost } from '@/lib/api'

const schema = z.object({
  email: z.string().email('Enter a valid email address'),
  code: z.string().length(6, 'Enter the 6-digit code'),
  password: z
    .string()
    .min(8, 'At least 8 characters')
    .regex(/[a-zA-Z]/, 'Must contain a letter')
    .regex(/[0-9]/, 'Must contain a number'),
})

type FormData = z.infer<typeof schema>

function ResetPasswordForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const defaultEmail = searchParams.get('email') ?? ''
  const defaultCode = searchParams.get('code') ?? ''
  
  const isSetupMode = !!(defaultEmail && defaultCode)

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      email: defaultEmail,
      code: defaultCode,
      password: '',
    }
  })

  const onSubmit = async (data: FormData) => {
    try {
      await apiPost('/auth/reset-password', {
        email: data.email,
        code: data.code,
        newPassword: data.password,
      })
      
      if (isSetupMode) {
        toast.success('Account activated! Sign in with your new password.')
      } else {
        toast.success('Password reset! Sign in with your new password.')
      }
      router.push('/signin')
    } catch (err: any) {
      toast.error(err?.response?.data?.error?.message ?? 'Action failed. Code may be expired.')
    }
  }

  return (
    <>
      <h1 className="text-h3 font-bold text-ink mb-2">
        {isSetupMode ? 'ACTIVATE CANVAS.' : 'RESET PASSWORD.'}
      </h1>
      <p className="text-caption text-ink-muted mb-10">
        {isSetupMode 
          ? 'Choose a password to activate your ByU Connect profile.' 
          : 'Enter your email, code and new password.'}
      </p>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-8" noValidate>
        {isSetupMode ? (
          <>
            <input type="hidden" {...register('email')} />
            <input type="hidden" {...register('code')} />
          </>
        ) : (
          <>
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
              <label className="text-overline text-ink-muted block mb-3">6-DIGIT CODE</label>
              <input
                {...register('code')}
                type="text"
                inputMode="numeric"
                placeholder="000000"
                maxLength={6}
                className="w-full border-b border-line bg-transparent text-body text-ink placeholder:text-ink-faint pb-2 focus:outline-none focus:border-ink transition-colors"
              />
              {errors.code && <p className="text-caption text-state-error mt-1">{errors.code.message}</p>}
            </div>
          </>
        )}

        <div>
          <label className="text-overline text-ink-muted block mb-3">
            {isSetupMode ? 'CHOOSE PASSWORD' : 'NEW PASSWORD'}
          </label>
          <input
            {...register('password')}
            type="password"
            placeholder="Min 8 chars, letter + number"
            className="w-full border-b border-line bg-transparent text-body text-ink placeholder:text-ink-faint pb-2 focus:outline-none focus:border-ink transition-colors"
          />
          {errors.password && <p className="text-caption text-state-error mt-1">{errors.password.message}</p>}
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full bg-ink text-bg text-overline py-4 hover:bg-ink-soft transition-colors disabled:opacity-50"
        >
          {isSubmitting 
            ? (isSetupMode ? 'ACTIVATING...' : 'RESETTING...') 
            : (isSetupMode ? 'ACTIVATE & SET PASSWORD →' : 'SET NEW PASSWORD →')}
        </button>
      </form>
    </>
  )
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center p-12">
        <span className="text-overline text-ink-muted animate-pulse">LOADING...</span>
      </div>
    }>
      <ResetPasswordForm />
    </Suspense>
  )
}
