'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useMutation } from '@tanstack/react-query'
import { toast } from 'sonner'
import { DashboardTopbar } from '@/components/layout/DashboardTopbar'
import { apiDelete } from '@/lib/api'
import { useAuth } from '@/hooks/useAuth'

export default function DangerPage() {
  const router = useRouter()
  const { signOut } = useAuth()
  const [confirm, setConfirm] = useState('')

  const deleteAccount = useMutation({
    mutationFn: () => apiDelete('/auth/account'),
    onSuccess: async () => {
      toast.success('Account deleted.')
      await signOut()
      router.push('/')
    },
    onError: () => toast.error('Failed to delete account. Please try again.'),
  })

  return (
    <>
      <DashboardTopbar title="Danger Zone" />
      <div className="flex-1 px-6 md:px-8 py-10 max-w-[560px] overflow-auto">
        <div className="border border-state-error p-8">
          <p className="text-overline text-state-error mb-2">DELETE ACCOUNT</p>
          <p className="text-meta font-bold text-ink mb-3">This action is permanent and cannot be undone.</p>
          <p className="text-caption text-ink-muted mb-6">
            All your data — profile, projects, stories, links, contacts, and resume — will be permanently deleted.
            Your canvas will no longer be accessible.
          </p>

          <div className="mb-5">
            <label className="text-overline text-ink-muted block mb-2">TYPE "DELETE" TO CONFIRM</label>
            <input
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              placeholder="DELETE"
              className="w-full border-b border-line bg-transparent text-body text-ink pb-2 focus:outline-none focus:border-state-error font-mono"
            />
          </div>

          <button
            onClick={() => deleteAccount.mutate()}
            disabled={confirm !== 'DELETE' || deleteAccount.isPending}
            className="bg-state-error text-white text-overline px-6 py-2.5 hover:opacity-90 transition-opacity disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {deleteAccount.isPending ? 'DELETING...' : 'DELETE MY ACCOUNT'}
          </button>
        </div>
      </div>
    </>
  )
}
