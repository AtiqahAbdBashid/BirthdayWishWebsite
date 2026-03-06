import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function GET(request: NextRequest) {
    try {
        const requestUrl = new URL(request.url)
        const error = requestUrl.searchParams.get('error')
        const errorCode = requestUrl.searchParams.get('error_code')
        const errorDescription = requestUrl.searchParams.get('error_description')

        console.log('Auth callback received:', {
            url: request.url,
            error,
            errorCode,
            errorDescription
        })

        // Handle expired token error - redirect to login with friendly message
        if (error === 'access_denied' && errorCode === 'otp_expired') {
            return NextResponse.redirect(
                new URL('/login?error=expired&message=The+confirmation+link+has+expired.+Please+sign+up+again+to+receive+a+new+link.', request.url)
            )
        }

        // Handle any other auth errors
        if (error) {
            return NextResponse.redirect(
                new URL(`/login?error=auth_failed&message=${encodeURIComponent(errorDescription || 'Authentication failed')}`, request.url)
            )
        }

        // If no error and we have a code, process it
        const code = requestUrl.searchParams.get('code')
        if (code) {
            // Dynamically import the server client only when needed
            const { createClient } = await import('@/lib/supabase/server')
            const supabase = await createClient()
            const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code)

            if (exchangeError) {
                console.error('Error exchanging code:', exchangeError)
                return NextResponse.redirect(
                    new URL('/login?error=confirmation_failed', request.url)
                )
            }

            // Success! Redirect to wish page
            return NextResponse.redirect(new URL('/wish?confirmed=true', request.url))
        }

        // If we get here with no code and no error, something weird happened
        return NextResponse.redirect(new URL('/login?error=unknown', request.url))

    } catch (error) {
        console.error('Critical error in auth callback:', error)
        // Even if something crashes, show a friendly page instead of 500
        return NextResponse.redirect(
            new URL('/login?error=server_error&message=Something+went+wrong.+Please+try+again.', request.url)
        )
    }
}