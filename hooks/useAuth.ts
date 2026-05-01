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
        const data = await apiGet<{ user: AuthUser; accessToken: string }>('/auth/me')
        // /auth/me returns a fresh access token so we store it
        if (data.accessToken) setAccessToken(data.accessToken)
        return data.user
      } catch {
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
