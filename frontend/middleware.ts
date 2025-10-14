import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

const PUBLIC_PATHS = ['/login']

export function middleware(req: NextRequest) {
  const { pathname, search } = req.nextUrl

  const isPublic = PUBLIC_PATHS.includes(pathname)
  const token = req.cookies.get('authToken')?.value

  if (isPublic) {
    if (token) {
      const url = req.nextUrl.clone()
      url.pathname = '/'
      url.search = ''
      return NextResponse.redirect(url)
    }
    return NextResponse.next()
  }

  if (!token) {
    const url = req.nextUrl.clone()
    url.pathname = '/login'
    // preserve intended destination
    const from = encodeURIComponent(pathname + (search || ''))
    return NextResponse.redirect(url)
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico|assets/|public/).*)',
  ],
}


