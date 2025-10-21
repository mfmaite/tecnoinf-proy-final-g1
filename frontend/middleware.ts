import { withAuth } from "next-auth/middleware"

export default withAuth(
  function middleware(req) {
    // Si está loggeado y trata de acceder a /login, redirigir a /
    if (req.nextUrl.pathname.startsWith('/login') && req.nextauth.token) {
      return Response.redirect(new URL('/', req.url))
    }

    // Si está loggeado pero no es admin y trata de acceder a /admin, redirigir a /
    if (req.nextUrl.pathname.startsWith('/admin') && req.nextauth.token && req.nextauth.token.role !== 'ADMIN') {
      return Response.redirect(new URL('/', req.url))
    }
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        if (req.nextUrl.pathname.startsWith('/login') ||
            req.nextUrl.pathname.startsWith('/api/auth')) {
          return true
        }

        if (!token) {
          return false
        }

        if (req.nextUrl.pathname.startsWith('/admin')) {
          return token.role === 'ADMIN'
        }

        return true
      },
    },
  }
)

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
}
