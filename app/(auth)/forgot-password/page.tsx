'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import Link from 'next/link'
import { toast } from 'sonner'
import { apiPost } from '@/lib/api'

const schema = z.object({ email: z.string().email() })
type FormData = z.infer<typeof schema>

export default function ForgotPasswordPage() {
  const { register, handleSubmit, formState: { errors, isSubmitting, isSubmitSuccessful } } =
    useForm<FormData>({ resolver: zodResolver(schema) })

  const onSubmit = async (data: FormData) => {
    try {
      await apiPost('/auth/forgot-password', data)
    } catch {
      // Silent — same response for existing/non-existing email (security)
    }
  }

  if (isSubmitSuccessful) {
    return (
      <>
        <h1 className="text-h3 font-bold text-ink mb-2">CHECK YOUR EMAIL.</h1>
        <p className="text-caption text-ink-muted mb-10">
          If that address is registered, we sent a reset code.
        </p>
        <Link href="/reset-password" className="text-overline text-ink underline underline-offset-2">
          Enter reset code →
        </Link>
      </>
    )
  }

  return (
    <>
      <h1 className="text-h3 font-bold text-ink mb-2">FORGOT PASSWORD.</h1>
      <p className="text-caption text-ink-muted mb-10">
        Enter your email and we'll send a reset code.
      </p>

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

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full bg-ink text-bg text-overline py-4 hover:bg-ink-soft transition-colors disabled:opacity-50"
        >
          {isSubmitting ? 'SENDING...' : 'SEND RESET CODE →'}
        </button>
      </form>

      <p className="text-caption text-ink-muted text-center mt-8">
        <Link href="/signin" className="text-ink underline underline-offset-2">Back to sign in</Link>
      </p>
    </>
  )
}
