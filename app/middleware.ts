import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
    // Public paths that don't require authentication
    const publicPaths = ['/', '/login', '/auth/callback']
    const isPublicPath = publicPaths.some(path =>
        request.nextUrl.pathname.startsWith(path)
    )

    // Check if user is authenticated by looking for the Supabase session cookie
    const hasSession = request.cookies.has('sb-access-token') ||
        request.cookies.has('sb-refresh-token')

    // If it's not a public path and there's no session, redirect to login
    if (!isPublicPath && !hasSession) {
        const redirectUrl = new URL('/login', request.url)
        redirectUrl.searchParams.set('redirect', request.nextUrl.pathname)
        return NextResponse.redirect(redirectUrl)
    }

    // If user is logged in and tries to access login page, redirect to wish page
    if (hasSession && request.nextUrl.pathname === '/login') {
        return NextResponse.redirect(new URL('/wish', request.url))
    }

    return NextResponse.next()
}

export const config = {
    matcher: [
        /*
         * Match all request paths except:
         * - _next/static (static files)
         * - _next/image (image optimization files)
         * - favicon.ico (favicon file)
         * - public folder
         */
        '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
    ],
}