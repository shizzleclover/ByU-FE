const API_BASE_URL = 'https://api.byu-connect.com'

export class ApiError extends Error {
  constructor(
    public status: number,
    public code: string,
    message: string,
  ) {
    super(message)
    this.name = 'ApiError'
  }
}

interface FetchOptions extends RequestInit {
  token?: string
}

export async function apiCall<T>(
  endpoint: string,
  options: FetchOptions = {},
): Promise<T> {
  const { token, ...fetchOptions } = options
  const headers = new Headers(fetchOptions.headers)

  // Add authorization token if provided
  if (token) {
    headers.set('Authorization', `Bearer ${token}`)
  }

  // Set default content type for JSON
  if (!headers.has('Content-Type') && fetchOptions.body) {
    headers.set('Content-Type', 'application/json')
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...fetchOptions,
    headers,
  })

  const data = await response.json() as any

  if (!response.ok) {
    throw new ApiError(
      response.status,
      data.code || 'UNKNOWN_ERROR',
      data.message || data.error || 'An error occurred',
    )
  }

  return data.data || data
}

// GET request
export async function apiGet<T>(
  endpoint: string,
  token?: string,
): Promise<T> {
  return apiCall<T>(endpoint, { method: 'GET', token })
}

// POST request
export async function apiPost<T>(
  endpoint: string,
  body: any,
  token?: string,
): Promise<T> {
  return apiCall<T>(endpoint, {
    method: 'POST',
    body: JSON.stringify(body),
    token,
  })
}

// PUT request
export async function apiPut<T>(
  endpoint: string,
  body: any,
  token?: string,
): Promise<T> {
  return apiCall<T>(endpoint, {
    method: 'PUT',
    body: JSON.stringify(body),
    token,
  })
}

// DELETE request
export async function apiDelete<T>(
  endpoint: string,
  token?: string,
): Promise<T> {
  return apiCall<T>(endpoint, { method: 'DELETE', token })
}
