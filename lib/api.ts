import axios, { AxiosError, AxiosRequestConfig } from 'axios'

const BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:5000/api/v1'

let accessToken: string | null = null

if (typeof window !== 'undefined') {
  accessToken = sessionStorage.getItem('access_token')
}

export function setAccessToken(token: string | null) {
  accessToken = token
  if (typeof window !== 'undefined') {
    if (token) {
      sessionStorage.setItem('access_token', token)
      // Indicator cookie readable by middleware (not a secret — real auth is httpOnly refresh token)
      document.cookie = 'auth_present=1; path=/; max-age=604800; SameSite=Lax'
    } else {
      sessionStorage.removeItem('access_token')
      document.cookie = 'auth_present=; path=/; max-age=0; SameSite=Lax'
    }
  }
}

export function getAccessToken() {
  return accessToken
}

export const api = axios.create({
  baseURL: BASE_URL,
  withCredentials: true, // send httpOnly refresh token cookie
})

// Attach access token to every request
api.interceptors.request.use((config) => {
  if (accessToken) {
    config.headers['Authorization'] = `Bearer ${accessToken}`
  }
  return config
})

let isRefreshing = false
let refreshQueue: Array<(token: string | null) => void> = []

function processQueue(token: string | null) {
  refreshQueue.forEach((cb) => cb(token))
  refreshQueue = []
}

// On 401 → try refresh → retry original request
api.interceptors.response.use(
  (res) => res,
  async (error: AxiosError) => {
    const original = error.config as AxiosRequestConfig & { _retry?: boolean }

    if (error.response?.status === 401 && !original._retry) {
      if (original.url === '/auth/refresh') {
        // Refresh itself failed — clear and redirect
        setAccessToken(null)
        if (typeof window !== 'undefined') window.location.href = '/signin'
        return Promise.reject(error)
      }

      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          refreshQueue.push((token) => {
            if (token) {
              original.headers = { ...original.headers, Authorization: `Bearer ${token}` }
              resolve(api(original))
            } else {
              reject(error)
            }
          })
        })
      }

      original._retry = true
      isRefreshing = true

      try {
        const res = await api.post<{ success: boolean; data: { accessToken: string } }>(
          '/auth/refresh',
        )
        const newToken = res.data.data.accessToken
        setAccessToken(newToken)
        processQueue(newToken)
        original.headers = { ...original.headers, Authorization: `Bearer ${newToken}` }
        return api(original)
      } catch {
        processQueue(null)
        setAccessToken(null)
        if (typeof window !== 'undefined') window.location.href = '/signin'
        return Promise.reject(error)
      } finally {
        isRefreshing = false
      }
    }

    return Promise.reject(error)
  },
)

// Unwrap the backend envelope { success, data }
export async function apiGet<T>(url: string, params?: Record<string, unknown>): Promise<T> {
  const res = await api.get<{ success: boolean; data: T }>(url, { params })
  return res.data.data
}

export async function apiPost<T>(url: string, body?: unknown): Promise<T> {
  const res = await api.post<{ success: boolean; data: T }>(url, body)
  return res.data.data
}

export async function apiPatch<T>(url: string, body?: unknown): Promise<T> {
  const res = await api.patch<{ success: boolean; data: T }>(url, body)
  return res.data.data
}

export async function apiDelete<T = void>(url: string): Promise<T> {
  const res = await api.delete<{ success: boolean; data: T }>(url)
  return res.data.data
}

export function apiError(error: unknown): string {
  if (axios.isAxiosError(error)) {
    return error.response?.data?.error?.message ?? error.message
  }
  return 'An unexpected error occurred'
}
