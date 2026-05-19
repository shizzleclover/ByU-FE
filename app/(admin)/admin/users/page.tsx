'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { Search, ExternalLink, ShieldCheck, Star } from 'lucide-react'
import { DashboardTopbar } from '@/components/layout/DashboardTopbar'
import { apiGet, apiPatch, apiPost, apiDelete } from '@/lib/api'
import { useDebouncedValue } from '@/hooks/useDebouncedValue'

interface AdminUser {
  _id: string
  username: string
  email: string
  fullName: string
  avatarUrl?: string
  role: string
  isSuspended: boolean
  isVerified: boolean
  isFeatured?: boolean
  createdAt: string
}

export default function AdminUsersPage() {
  const qc = useQueryClient()
  const [query, setQuery] = useState('')
  const debouncedQ = useDebouncedValue(query, 300)

  const { data: users = [], isLoading } = useQuery({
    queryKey: ['admin', 'users', debouncedQ],
    queryFn: () => apiGet<AdminUser[]>(`/admin/users${debouncedQ ? `?q=${debouncedQ}` : ''}`),
  })

  const update = useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: object }) => apiPatch(`/admin/users/${id}`, payload),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['admin', 'users'] }); toast.success('User updated.') },
    onError: () => toast.error('Failed to update.'),
  })

  const toggleFeature = useMutation({
    mutationFn: ({ userId, isFeatured }: { userId: string; isFeatured: boolean }) =>
      isFeatured
        ? apiDelete(`/admin/featured/${userId}`)
        : apiPost('/admin/featured', { userId }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin', 'users'] })
      qc.invalidateQueries({ queryKey: ['admin', 'featured'] })
      toast.success('Featured status updated.')
    },
    onError: () => toast.error('Failed to update featured status.'),
  })

  return (
    <>
      <DashboardTopbar title="Users" />
      <div className="flex-1 px-6 md:px-8 py-10 overflow-auto">
        {/* Search */}
        <div className="relative mb-8 max-w-[500px]">
          <Search size={14} className="absolute left-0 top-1/2 -translate-y-1/2 text-ink-muted" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by name, username, or email..."
            className="w-full pl-6 border-b border-line bg-transparent text-body text-ink pb-2 focus:outline-none focus:border-ink"
          />
        </div>

        {isLoading ? (
          <div className="space-y-2">
            {[...Array(8)].map((_, i) => <div key={i} className="h-16 bg-bg-sunken animate-pulse" />)}
          </div>
        ) : users.length === 0 ? (
          <p className="text-caption text-ink-muted py-8">No users found.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-line">
                  <th className="text-overline text-ink-muted text-left py-3 pr-4">USER</th>
                  <th className="text-overline text-ink-muted text-left py-3 pr-4">EMAIL</th>
                  <th className="text-overline text-ink-muted text-left py-3 pr-4">ROLE</th>
                  <th className="text-overline text-ink-muted text-left py-3 pr-4">STATUS</th>
                  <th className="text-overline text-ink-muted text-left py-3 pr-4">JOINED</th>
                  <th className="text-overline text-ink-muted text-left py-3">ACTIONS</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {users.map((user) => (
                  <tr key={user._id} className="hover:bg-bg-sunken transition-colors">
                    <td className="py-3 pr-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full overflow-hidden bg-bg-sunken shrink-0">
                          {user.avatarUrl ? (
                            <Image src={user.avatarUrl} alt={user.fullName} width={32} height={32} className="object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-overline text-ink-faint">
                              {user.fullName.charAt(0)}
                            </div>
                          )}
                        </div>
                        <div>
                          <p className="text-meta font-bold text-ink flex items-center gap-1">
                            {user.fullName}
                            {user.isVerified && <ShieldCheck size={12} className="text-state-success" />}
                          </p>
                          <p className="text-caption text-ink-muted">@{user.username}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 pr-4">
                      <p className="text-caption text-ink-muted">{user.email}</p>
                    </td>
                    <td className="py-3 pr-4">
                      <span className={`text-overline ${user.role === 'admin' ? 'text-state-warn' : 'text-ink-muted'}`}>
                        {user.role.toUpperCase()}
                      </span>
                    </td>
                    <td className="py-3 pr-4">
                      <span className={`text-overline ${user.isSuspended ? 'text-state-error' : 'text-state-success'}`}>
                        {user.isSuspended ? 'SUSPENDED' : 'ACTIVE'}
                      </span>
                    </td>
                    <td className="py-3 pr-4">
                      <p className="text-caption text-ink-muted">{new Date(user.createdAt).toLocaleDateString()}</p>
                    </td>
                    <td className="py-3">
                      <div className="flex items-center gap-2">
                        <Link
                          href={`/${user.username}`}
                          target="_blank"
                          className="p-1.5 border border-line hover:border-ink transition-colors"
                          title="View canvas"
                        >
                          <ExternalLink size={12} />
                        </Link>
                        {user.role !== 'admin' && (
                          user.isFeatured ? (
                            <button
                              onClick={() => toggleFeature.mutate({ userId: user._id, isFeatured: true })}
                              disabled={toggleFeature.isPending}
                              className="text-overline border border-state-warn text-state-warn px-3 py-1 hover:bg-state-warn hover:text-ink transition-colors flex items-center gap-1"
                              title="Remove from featured"
                            >
                              <Star size={10} fill="currentColor" />
                              FEATURED
                            </button>
                          ) : (
                            <button
                              onClick={() => toggleFeature.mutate({ userId: user._id, isFeatured: false })}
                              disabled={toggleFeature.isPending}
                              className="text-overline border border-line px-3 py-1 hover:border-ink transition-colors flex items-center gap-1"
                              title="Add to featured"
                            >
                              <Star size={10} />
                              FEATURE
                            </button>
                          )
                        )}
                        {user.isSuspended ? (
                          <button
                            onClick={() => update.mutate({ id: user._id, payload: { isSuspended: false } })}
                            className="text-overline border border-line px-3 py-1 hover:border-ink transition-colors"
                          >
                            UNSUSPEND
                          </button>
                        ) : (
                          <button
                            onClick={() => update.mutate({ id: user._id, payload: { isSuspended: true } })}
                            className="text-overline border border-state-error text-state-error px-3 py-1 hover:bg-state-error hover:text-white transition-colors"
                          >
                            SUSPEND
                          </button>
                        )}
                        {user.role !== 'admin' && (
                          <button
                            onClick={() => update.mutate({ id: user._id, payload: { role: 'admin' } })}
                            className="text-overline border border-line px-3 py-1 hover:border-ink transition-colors"
                            title="Promote to admin"
                          >
                            MAKE ADMIN
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </>
  )
}
