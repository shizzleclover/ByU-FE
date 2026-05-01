import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

const AUTHED_PATHS = ['/dashboard']
const ADMIN_PATHS = ['/admin']
const AUTH_PATHS = ['/signin', '/signup', '/forgot-password', '/reset-password']

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  const refreshToken = request.cookies.get('refreshToken')?.value
  const isAuthenticated = !!refreshToken

  // Redirect authenticated users away from auth pages
  if (AUTH_PATHS.some((p) => pathname.startsWith(p))) {
    if (isAuthenticated) {
      return NextResponse.redirect(new URL('/dashboard', request.url))
    }
    return NextResponse.next()
  }

  // Protect /dashboard/* routes
  if (AUTHED_PATHS.some((p) => pathname.startsWith(p))) {
    if (!isAuthenticated) {
      const url = new URL('/signin', request.url)
      url.searchParams.set('redirect', pathname)
      return NextResponse.redirect(url)
    }
    return NextResponse.next()
  }

  // Protect /admin/* routes
  if (ADMIN_PATHS.some((p) => pathname.startsWith(p))) {
    if (!isAuthenticated) {
      return NextResponse.redirect(new URL('/signin', request.url))
    }
    // Role check done in the (admin) layout — middleware just checks cookie presence
    return NextResponse.next()
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/admin/:path*',
    '/signin',
    '/signup',
    '/verify-email',
    '/forgot-password',
    '/reset-password',
  ],
}
