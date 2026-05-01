'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { motion, AnimatePresence } from 'framer-motion'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { DashboardTopbar } from '@/components/layout/DashboardTopbar'
import { apiPost } from '@/lib/api'
import { useAuth, AUTH_KEY } from '@/hooks/useAuth'
import { ease } from '@/lib/motion'

const DOMAIN = process.env.NEXT_PUBLIC_STUDENT_EMAIL_DOMAIN ?? 'student.babcock.edu.ng'

const emailSchema = z.object({
  studentEmail: z
    .string()
    .email('Enter a valid email')
    .refine((v) => v.endsWith(`@${DOMAIN}`), `Must be a @${DOMAIN} address`),
})

const otpSchema = z.object({
  code: z.string().length(6, 'Enter the 6-digit code'),
})

type EmailForm = z.infer<typeof emailSchema>
type OtpForm = z.infer<typeof otpSchema>

function VerifiedBadge() {
  return (
    <motion.div
      className="flex flex-col items-center gap-6 py-8"
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5, ease: ease.expoOut }}
    >
      {/* Animated blue checkmark */}
      <div className="relative">
        {/* Outer ring pulse */}
        <motion.div
          className="absolute inset-0 rounded-full bg-blue-500/20"
          animate={{ scale: [1, 1.4, 1], opacity: [0.6, 0, 0.6] }}
          transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
        />
        {/* Badge circle */}
        <motion.div
          className="relative w-20 h-20 rounded-full bg-blue-500 flex items-center justify-center shadow-lg shadow-blue-500/30"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.1, duration: 0.5, ease: ease.expoOut }}
        >
          {/* Checkmark SVG drawn in */}
          <svg width="36" height="36" viewBox="0 0 36 36" fill="none">
            <motion.path
              d="M9 18L15 24L27 12"
              stroke="white"
              strokeWidth="3"
              strokeLinecap="round"
              strokeLinejoin="round"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ delay: 0.4, duration: 0.5, ease: ease.out }}
            />
          </svg>
        </motion.div>
      </div>

      <motion.div
        className="text-center"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5, duration: 0.4, ease: ease.out }}
      >
        <p className="text-h5 font-bold text-ink mb-1">Student Verified</p>
        <p className="text-caption text-ink-muted">
          Your blue badge is now live on your canvas.
        </p>
      </motion.div>
    </motion.div>
  )
}

export default function VerificationPage() {
  const { user } = useAuth()
  const qc = useQueryClient()
  const [step, setStep] = useState<'email' | 'otp'>('email')
  const [sentTo, setSentTo] = useState('')

  const emailForm = useForm<EmailForm>({ resolver: zodResolver(emailSchema) })
  const otpForm = useForm<OtpForm>({ resolver: zodResolver(otpSchema) })

  const sendOtp = useMutation({
    mutationFn: (data: EmailForm) =>
      apiPost('/verification/student-email/start', { studentEmail: data.studentEmail }),
    onSuccess: (_, vars) => {
      setSentTo(vars.studentEmail)
      setStep('otp')
      toast.success('Code sent — check your student email.')
    },
    onError: (err: unknown) => {
      const msg = err instanceof Error ? err.message : 'Failed to send code.'
      toast.error(msg)
    },
  })

  const confirmOtp = useMutation({
    mutationFn: (data: OtpForm) =>
      apiPost('/verification/student-email/confirm', { code: data.code }),
    onSuccess: () => {
      // Refresh auth so isVerified flips to true
      qc.invalidateQueries({ queryKey: AUTH_KEY })
      toast.success('Verified! Your blue badge is live.')
    },
    onError: (err: unknown) => {
      const msg = err instanceof Error ? err.message : 'Invalid code. Try again.'
      toast.error(msg)
    },
  })

  const isVerified = !!user?.studentEmailVerifiedAt

  return (
    <>
      <DashboardTopbar title="Student Verification" />
      <div className="flex-1 px-6 md:px-8 py-10 overflow-auto">
        <div className="max-w-[480px]">

          {/* Already verified */}
          {isVerified ? (
            <div className="border border-line p-8">
              <VerifiedBadge />
              <div className="border-t border-line pt-6 text-center">
                <p className="text-caption text-ink-muted">
                  Verified with{' '}
                  <span className="text-ink font-medium">{user?.studentEmail}</span>
                </p>
                {user?.studentEmailVerifiedAt && (
                  <p className="text-caption text-ink-faint mt-1">
                    {new Date(user.studentEmailVerifiedAt).toLocaleDateString('en-US', {
                      day: 'numeric', month: 'long', year: 'numeric',
                    })}
                  </p>
                )}
              </div>
            </div>
          ) : (
            <>
              {/* Header */}
              <div className="mb-8">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center shadow shadow-blue-500/30 shrink-0">
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                      <path d="M4 8L6.5 10.5L12 5" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </div>
                  <h2 className="text-h5 font-bold text-ink">Get Verified</h2>
                </div>
                <p className="text-body text-ink-soft">
                  Verify your <span className="text-ink font-medium">@{DOMAIN}</span> student email to earn a blue badge on your canvas — shown to everyone who views your profile.
                </p>
              </div>

              {/* Steps indicator */}
              <div className="flex items-center gap-2 mb-8">
                {(['email', 'otp'] as const).map((s, i) => (
                  <div key={s} className="flex items-center gap-2">
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-bold transition-colors ${
                      step === s
                        ? 'bg-blue-500 text-white'
                        : i < (['email', 'otp'].indexOf(step))
                        ? 'bg-blue-500/20 text-blue-500'
                        : 'bg-bg-sunken text-ink-muted'
                    }`}>
                      {i < (['email', 'otp'] as const).indexOf(step) ? '✓' : i + 1}
                    </div>
                    <span className={`text-caption ${step === s ? 'text-ink font-medium' : 'text-ink-muted'}`}>
                      {s === 'email' ? 'Student email' : 'Enter code'}
                    </span>
                    {i < 1 && <div className="w-6 h-px bg-line mx-1" />}
                  </div>
                ))}
              </div>

              <AnimatePresence mode="wait">
                {step === 'email' && (
                  <motion.form
                    key="email"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.25, ease: ease.out }}
                    onSubmit={emailForm.handleSubmit((d) => sendOtp.mutate(d))}
                    className="space-y-6"
                  >
                    <div>
                      <label className="text-overline text-ink-muted block mb-3">STUDENT EMAIL</label>
                      <input
                        {...emailForm.register('studentEmail')}
                        type="email"
                        placeholder={`yourname@${DOMAIN}`}
                        autoComplete="email"
                        className="w-full border-b border-line bg-transparent text-body text-ink placeholder:text-ink-faint pb-2 focus:outline-none focus:border-ink transition-colors"
                      />
                      {emailForm.formState.errors.studentEmail && (
                        <p className="text-caption text-state-error mt-2">
                          {emailForm.formState.errors.studentEmail.message}
                        </p>
                      )}
                    </div>

                    <button
                      type="submit"
                      disabled={sendOtp.isPending}
                      className="w-full bg-blue-500 text-white text-overline py-3.5 hover:bg-blue-600 transition-colors disabled:opacity-50"
                    >
                      {sendOtp.isPending ? 'SENDING...' : 'SEND VERIFICATION CODE →'}
                    </button>
                  </motion.form>
                )}

                {step === 'otp' && (
                  <motion.form
                    key="otp"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.25, ease: ease.out }}
                    onSubmit={otpForm.handleSubmit((d) => confirmOtp.mutate(d))}
                    className="space-y-6"
                  >
                    <div className="bg-bg-sunken px-4 py-3 text-caption text-ink-muted">
                      Code sent to <span className="text-ink font-medium">{sentTo}</span>. Check your inbox (and spam folder).
                    </div>

                    <div>
                      <label className="text-overline text-ink-muted block mb-3">6-DIGIT CODE</label>
                      <input
                        {...otpForm.register('code')}
                        type="text"
                        inputMode="numeric"
                        maxLength={6}
                        placeholder="123456"
                        autoComplete="one-time-code"
                        className="w-full border-b border-line bg-transparent text-h4 font-bold text-ink placeholder:text-ink-faint pb-2 focus:outline-none focus:border-ink transition-colors tracking-[0.3em]"
                      />
                      {otpForm.formState.errors.code && (
                        <p className="text-caption text-state-error mt-2">
                          {otpForm.formState.errors.code.message}
                        </p>
                      )}
                    </div>

                    <button
                      type="submit"
                      disabled={confirmOtp.isPending}
                      className="w-full bg-blue-500 text-white text-overline py-3.5 hover:bg-blue-600 transition-colors disabled:opacity-50"
                    >
                      {confirmOtp.isPending ? 'VERIFYING...' : 'VERIFY →'}
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setStep('email')
                        otpForm.reset()
                      }}
                      className="w-full text-caption text-ink-muted hover:text-ink transition-colors"
                    >
                      ← Use a different email
                    </button>

                    <p className="text-caption text-ink-faint text-center">
                      Didn&apos;t receive it?{' '}
                      <button
                        type="button"
                        onClick={() => sendOtp.mutate({ studentEmail: sentTo })}
                        disabled={sendOtp.isPending}
                        className="text-ink underline underline-offset-2 hover:text-ink-soft disabled:opacity-50"
                      >
                        Resend code
                      </button>
                    </p>
                  </motion.form>
                )}
              </AnimatePresence>
            </>
          )}
        </div>
      </div>
    </>
  )
}
