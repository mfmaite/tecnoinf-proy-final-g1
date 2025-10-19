import { withAuth } from "next-auth/middleware"

export default withAuth(
  function middleware(req) {
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        if (req.nextUrl.pathname.startsWith('/login') ||
            req.nextUrl.pathname.startsWith('/api/auth')) {
          return true
        }

        console.log(token)

        return !!token
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
