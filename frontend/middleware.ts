import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

const PUBLIC_PATHS = ['/login']

const ADMIN_PREFIX = '/admin'
const PROFESSOR_PREFIX = '/professor'
const STUDENT_PREFIX = '/student'

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  const isPublic = PUBLIC_PATHS.includes(pathname);
  const isRouteForAdmin = pathname.startsWith(ADMIN_PREFIX);
  const isRouteForProfessor = pathname.startsWith(PROFESSOR_PREFIX);
  const isRouteForStudent = pathname.startsWith(STUDENT_PREFIX);

  const token = req.cookies.get('authToken')?.value;
  const role = req.cookies.get('authRole')?.value;

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
    return NextResponse.redirect(url)
  }

  if (isRouteForAdmin && role !== 'ADMIN') {
    const url = req.nextUrl.clone()
    url.pathname = '/'
    return NextResponse.redirect(url)
  }

  if (isRouteForProfessor && role !== 'PROFESSOR') {
    const url = req.nextUrl.clone()
    url.pathname = '/'
    return NextResponse.redirect(url)
  }

  if (isRouteForStudent && role !== 'ESTUDIANTE') {
    const url = req.nextUrl.clone()
    url.pathname = '/'
    return NextResponse.redirect(url)
  }




  return NextResponse.next()
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico|assets/|public/).*)',
  ],
}


