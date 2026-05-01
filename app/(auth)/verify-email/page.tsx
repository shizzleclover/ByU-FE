'use client'

import { useRef, useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { toast } from 'sonner'
import { apiPost, setAccessToken } from '@/lib/api'
import { useQueryClient } from '@tanstack/react-query'
import { AUTH_KEY } from '@/hooks/useAuth'
import type { AuthResponse } from '@/types/api'

const RESEND_COOLDOWN = 60

export default function VerifyEmailPage() {
  const [digits, setDigits] = useState(['', '', '', '', '', ''])
  const [loading, setLoading] = useState(false)
  const [cooldown, setCooldown] = useState(0)
  const inputs = useRef<Array<HTMLInputElement | null>>([])
  const router = useRouter()
  const searchParams = useSearchParams()
  const qc = useQueryClient()

  const email =
    searchParams.get('email') ??
    (typeof window !== 'undefined' ? sessionStorage.getItem('pending_email') : null) ??
    ''

  // Focus first input on mount
  useEffect(() => { inputs.current[0]?.focus() }, [])

  // Countdown timer for resend
  useEffect(() => {
    if (cooldown <= 0) return
    const id = setTimeout(() => setCooldown((c) => c - 1), 1000)
    return () => clearTimeout(id)
  }, [cooldown])

  // Auto-submit when all 6 digits filled
  useEffect(() => {
    const code = digits.join('')
    if (code.length === 6 && digits.every((d) => d !== '')) {
      submit(code)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [digits])

  const focusNext = (i: number) => inputs.current[Math.min(i + 1, 5)]?.focus()
  const focusPrev = (i: number) => inputs.current[Math.max(i - 1, 0)]?.focus()

  const handleChange = (i: number, val: string) => {
    // Handle paste of full 6-digit code anywhere
    if (val.length === 6 && /^\d{6}$/.test(val)) {
      setDigits(val.split(''))
      inputs.current[5]?.focus()
      return
    }
    // Accept only a single digit
    const digit = val.replace(/\D/g, '').slice(-1)
    setDigits((prev) => {
      const next = [...prev]
      next[i] = digit
      return next
    })
    if (digit) focusNext(i)
  }

  const handleKeyDown = (i: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace') {
      if (digits[i]) {
        setDigits((prev) => { const n = [...prev]; n[i] = ''; return n })
      } else {
        focusPrev(i)
      }
      e.preventDefault()
    } else if (e.key === 'ArrowLeft') {
      focusPrev(i)
    } else if (e.key === 'ArrowRight') {
      focusNext(i)
    }
  }

  const handlePaste = (e: React.ClipboardEvent) => {
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6)
    if (!pasted) return
    e.preventDefault()
    const filled = pasted.split('').concat(Array(6).fill('')).slice(0, 6)
    setDigits(filled)
    inputs.current[Math.min(pasted.length, 5)]?.focus()
  }

  const submit = async (code: string) => {
    if (!email) { toast.error('Email not found. Please sign up again.'); return }
    setLoading(true)
    try {
      const res = await apiPost<AuthResponse>('/auth/verify-email', { email, code })
      if (res?.accessToken) {
        setAccessToken(res.accessToken)
        qc.setQueryData(AUTH_KEY, res.user)
      }
      sessionStorage.removeItem('pending_email')
      router.push('/onboarding')
    } catch (err: any) {
      toast.error(err?.response?.data?.error?.message ?? 'Invalid or expired code.')
      // Clear and refocus on error
      setDigits(['', '', '', '', '', ''])
      setTimeout(() => inputs.current[0]?.focus(), 50)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const code = digits.join('')
    if (code.length < 6) return
    submit(code)
  }

  const resend = async () => {
    if (cooldown > 0 || !email) return
    try {
      await apiPost('/auth/resend-verification', { email })
      toast.success('New code sent.')
      setCooldown(RESEND_COOLDOWN)
    } catch {
      toast.error('Could not resend. Try again shortly.')
    }
  }

  const filledCount = digits.filter((d) => d !== '').length

  return (
    <>
      <p className="text-overline text-ink-muted mb-2">STEP 2 OF 2</p>
      <h1 className="text-h3 font-bold text-ink mb-1">CHECK YOUR EMAIL.</h1>
      <p className="text-caption text-ink-muted mb-1">We sent a 6-digit code to</p>
      <p className="text-caption font-bold text-ink mb-8 truncate">{email || '—'}</p>

      <form onSubmit={handleSubmit} onPaste={handlePaste}>
        {/* OTP inputs */}
        <div className="flex gap-2 mb-8">
          {digits.map((digit, i) => (
            <input
              key={i}
              ref={(el) => { inputs.current[i] = el }}
              type="text"
              inputMode="numeric"
              maxLength={6}
              value={digit}
              onChange={(e) => handleChange(i, e.target.value)}
              onKeyDown={(e) => handleKeyDown(i, e)}
              disabled={loading}
              className="flex-1 min-w-0 text-center text-h5 font-bold text-ink border-b-2 border-line focus:border-ink bg-transparent py-3 focus:outline-none transition-colors disabled:opacity-40"
            />
          ))}
        </div>

        {/* Progress bar */}
        <div className="h-px bg-line mb-6 overflow-hidden">
          <div
            className="h-full bg-ink transition-all duration-300"
            style={{ width: `${(filledCount / 6) * 100}%` }}
          />
        </div>

        <button
          type="submit"
          disabled={loading || filledCount < 6}
          className="w-full bg-ink text-bg text-overline py-4 hover:bg-ink-soft transition-colors disabled:opacity-40"
        >
          {loading ? 'VERIFYING...' : 'VERIFY →'}
        </button>
      </form>

      <p className="text-caption text-ink-muted text-center mt-6">
        Didn't receive it?{' '}
        {cooldown > 0 ? (
          <span className="text-ink-faint">Resend in {cooldown}s</span>
        ) : (
          <button
            onClick={resend}
            className="text-ink underline underline-offset-2 hover:text-ink-soft transition-colors"
          >
            Resend code
          </button>
        )}
      </p>
    </>
  )
}
