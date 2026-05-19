'use client'

import { useQuery, useQueryClient } from '@tanstack/react-query'
import { apiGet, apiPost, setAccessToken } from '@/lib/api'
import type { AuthUser } from '@/types/api'

export const AUTH_KEY = ['auth', 'me'] as const

export function useAuth() {
  const qc = useQueryClient()

  const { data: user, isLoading, error } = useQuery<AuthUser | null>({
    queryKey: AUTH_KEY,
    queryFn: async () => {
      try {
        const data = await apiGet<{ user: Record<string, unknown>; profile: Record<string, unknown> | null }>('/auth/me')
        // Merge user and profile fields into the AuthUser shape the frontend expects
        const role = data.user.role as 'user' | 'admin'
        if (typeof window !== 'undefined') {
          if (role === 'admin') {
            document.cookie = 'is_admin=1; path=/; max-age=604800; SameSite=Lax'
          } else {
            document.cookie = 'is_admin=; path=/; max-age=0; SameSite=Lax'
          }
        }

        return {
          _id: String(data.user.id ?? data.user._id),
          email: data.user.email as string,
          role,
          isVerified: !!data.user.isVerified,
          isEmailVerified: data.user.isEmailVerified as boolean,
          studentEmail: data.user.studentEmail as string | undefined,
          studentEmailVerifiedAt: data.user.studentEmailVerifiedAt as string | undefined,
          username: (data.profile?.username as string) ?? '',
          isSuspended: (data.user.isSuspended as boolean) ?? false,
          createdAt: (data.user.createdAt as string) ?? '',
          updatedAt: (data.user.updatedAt as string) ?? '',
        } as AuthUser
      } catch {
        if (typeof window !== 'undefined') {
          document.cookie = 'is_admin=; path=/; max-age=0; SameSite=Lax'
        }
        return null
      }
    },
    staleTime: 5 * 60_000,
    retry: false,
  })

  const signOut = async () => {
    try {
      await apiPost('/auth/signout', {})
    } finally {
      setAccessToken(null)
      if (typeof window !== 'undefined') {
        document.cookie = 'is_admin=; path=/; max-age=0; SameSite=Lax'
      }
      qc.setQueryData(AUTH_KEY, null)
      qc.clear()
      window.location.href = '/signin'
    }
  }

  return {
    user: user ?? null,
    isLoading,
    isAuthenticated: !!user,
    isAdmin: user?.role === 'admin',
    error,
    signOut,
  }
}
