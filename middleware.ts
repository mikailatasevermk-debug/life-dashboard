import { withAuth } from "next-auth/middleware"
import { NextResponse } from "next/server"

export default withAuth(
  function middleware(req) {
    return NextResponse.next()
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        // Allow public routes
        const publicRoutes = ["/", "/auth/signin", "/auth/verify", "/api/auth"]
        const isPublicRoute = publicRoutes.some(route => 
          req.nextUrl.pathname.startsWith(route)
        )
        
        if (isPublicRoute) return true
        
        // Require authentication for all other routes
        return !!token
      },
    },
  }
)

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|public).*)",
  ],
}