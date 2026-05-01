'use client'

import { useMutation } from '@tanstack/react-query'
import { toast } from 'sonner'
import { CheckCircle, Clock } from 'lucide-react'
import { DashboardTopbar } from '@/components/layout/DashboardTopbar'
import { apiPost } from '@/lib/api'
import { useAuth } from '@/hooks/useAuth'

export default function VerificationPage() {
  const { user } = useAuth()

  const requestVerification = useMutation({
    mutationFn: () => apiPost('/auth/request-verification', {}),
    onSuccess: () => toast.success('Verification email sent. Check your inbox.'),
    onError: () => toast.error('Failed to send verification email.'),
  })

  return (
    <>
      <DashboardTopbar title="Verification" />
      <div className="flex-1 px-6 md:px-8 py-10 max-w-[560px] overflow-auto">
        {user?.isVerified ? (
          <div className="border border-line p-8 flex flex-col items-center text-center">
            <CheckCircle size={40} className="text-state-success mb-4" />
            <p className="text-h6 font-bold text-ink mb-2">Account verified</p>
            <p className="text-caption text-ink-muted">
              Your BYU email has been verified. Your canvas displays a verified badge.
            </p>
            {user.studentEmailVerifiedAt && (
              <p className="text-caption text-ink-faint mt-3">
                Verified {new Date(user.studentEmailVerifiedAt).toLocaleDateString()}
              </p>
            )}
          </div>
        ) : (
          <div className="border border-line p-8 flex flex-col items-center text-center">
            <Clock size={40} className="text-ink-muted mb-4" />
            <p className="text-h6 font-bold text-ink mb-2">Not yet verified</p>
            <p className="text-caption text-ink-muted mb-6">
              Verify your BYU email address to get a verified badge on your canvas and increase trust with employers.
            </p>
            <button
              onClick={() => requestVerification.mutate()}
              disabled={requestVerification.isPending || requestVerification.isSuccess}
              className="bg-ink text-bg text-overline px-8 py-3 hover:bg-ink-soft transition-colors disabled:opacity-50"
            >
              {requestVerification.isPending
                ? 'SENDING...'
                : requestVerification.isSuccess
                ? 'EMAIL SENT ✓'
                : 'SEND VERIFICATION EMAIL →'}
            </button>
          </div>
        )}
      </div>
    </>
  )
}
