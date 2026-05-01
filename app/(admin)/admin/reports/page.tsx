'use client'

import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { DashboardTopbar } from '@/components/layout/DashboardTopbar'
import { apiGet, apiPatch } from '@/lib/api'
import type { Report } from '@/types/api'

type Status = 'pending' | 'reviewed' | 'dismissed'

const STATUS_LABELS: Record<Status, string> = {
  pending: 'PENDING',
  reviewed: 'REVIEWED',
  dismissed: 'DISMISSED',
}

export default function AdminReportsPage() {
  const qc = useQueryClient()
  const [status, setStatus] = useState<Status>('pending')
  const [selected, setSelected] = useState<Report | null>(null)

  const { data: reports = [], isLoading } = useQuery({
    queryKey: ['admin', 'reports', status],
    queryFn: () => apiGet<Report[]>(`/admin/reports?status=${status}`),
  })

  const updateReport = useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: object }) => apiPatch(`/admin/reports/${id}`, payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin', 'reports'] })
      toast.success('Report updated.')
      setSelected(null)
    },
    onError: () => toast.error('Failed to update.'),
  })

  const suspendUser = useMutation({
    mutationFn: (userId: string) => apiPatch(`/admin/users/${userId}`, { isSuspended: true }),
    onSuccess: () => toast.success('User suspended.'),
    onError: () => toast.error('Failed to suspend user.'),
  })

  return (
    <>
      <DashboardTopbar title="Reports" />
      <div className="flex-1 flex overflow-hidden">
        {/* List */}
        <div className={`flex flex-col ${selected ? 'w-1/2' : 'flex-1'} border-r border-line`}>
          {/* Filter tabs */}
          <div className="flex border-b border-line">
            {(['pending', 'reviewed', 'dismissed'] as Status[]).map((s) => (
              <button
                key={s}
                onClick={() => { setStatus(s); setSelected(null) }}
                className={`flex-1 py-3 text-overline transition-colors ${status === s ? 'text-ink border-b-2 border-ink' : 'text-ink-muted hover:text-ink'}`}
              >
                {STATUS_LABELS[s]}
              </button>
            ))}
          </div>

          <div className="flex-1 overflow-auto">
            {isLoading ? (
              <div className="space-y-2 p-4">
                {[...Array(5)].map((_, i) => <div key={i} className="h-16 bg-bg-sunken animate-pulse" />)}
              </div>
            ) : reports.length === 0 ? (
              <p className="text-caption text-ink-muted p-8 text-center">No {status} reports.</p>
            ) : (
              <div className="divide-y divide-line">
                {reports.map((report) => (
                  <button
                    key={report._id}
                    onClick={() => setSelected(report)}
                    className={`w-full text-left px-6 py-4 hover:bg-bg-sunken transition-colors ${selected?._id === report._id ? 'bg-bg-sunken' : ''}`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <p className="text-meta font-bold text-ink">@{report.targetUsername ?? report.targetProfile?.username}</p>
                      <p className="text-caption text-ink-muted">{new Date(report.createdAt).toLocaleDateString()}</p>
                    </div>
                    <p className="text-caption text-ink-muted line-clamp-1">{report.reason}</p>
                    {report.reporterUsername && (
                      <p className="text-overline text-ink-faint mt-1">by @{report.reporterUsername}</p>
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Detail panel */}
        {selected && (
          <div className="w-1/2 flex flex-col overflow-auto">
            <div className="px-6 py-6 border-b border-line flex items-center justify-between">
              <p className="text-overline text-ink-muted">REPORT DETAIL</p>
              <button onClick={() => setSelected(null)} className="text-caption text-ink-muted hover:text-ink">Close</button>
            </div>

            <div className="px-6 py-6 flex-1">
              <div className="space-y-5">
                <div>
                  <p className="text-overline text-ink-muted mb-1">REPORTED USER</p>
                  <p className="text-meta font-bold text-ink">@{selected.targetUsername ?? selected.targetProfile?.username}</p>
                </div>
                {selected.reporterUsername && (
                  <div>
                    <p className="text-overline text-ink-muted mb-1">REPORTED BY</p>
                    <p className="text-meta text-ink">@{selected.reporterUsername}</p>
                  </div>
                )}
                <div>
                  <p className="text-overline text-ink-muted mb-1">REASON</p>
                  <p className="text-body text-ink">{selected.reason}</p>
                </div>
                {(selected.description || selected.details) && (
                  <div>
                    <p className="text-overline text-ink-muted mb-1">DETAILS</p>
                    <p className="text-caption text-ink-muted">{selected.description ?? selected.details}</p>
                  </div>
                )}
                <div>
                  <p className="text-overline text-ink-muted mb-1">DATE</p>
                  <p className="text-caption text-ink">{new Date(selected.createdAt).toLocaleString()}</p>
                </div>
              </div>

              <div className="mt-8 space-y-3">
                <p className="text-overline text-ink-muted mb-3">ACTIONS</p>
                <button
                  onClick={() => updateReport.mutate({ id: selected._id, payload: { status: 'dismissed' } })}
                  disabled={updateReport.isPending}
                  className="w-full border border-line py-2.5 text-overline hover:border-ink transition-colors disabled:opacity-50"
                >
                  DISMISS REPORT
                </button>
                <button
                  onClick={() => updateReport.mutate({ id: selected._id, payload: { status: 'reviewed' } })}
                  disabled={updateReport.isPending}
                  className="w-full border border-line py-2.5 text-overline hover:border-ink transition-colors disabled:opacity-50"
                >
                  MARK REVIEWED
                </button>
                <button
                  onClick={() => {
                    const uid = selected.targetUserId ?? selected.targetProfileId
                    if (uid) suspendUser.mutate(uid)
                    updateReport.mutate({ id: selected._id, payload: { status: 'reviewed' } })
                  }}
                  disabled={updateReport.isPending || suspendUser.isPending}
                  className="w-full bg-state-error text-white py-2.5 text-overline hover:opacity-90 transition-opacity disabled:opacity-50"
                >
                  SUSPEND USER
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  )
}
