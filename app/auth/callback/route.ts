import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function GET(request: NextRequest) {
    const requestUrl = new URL(request.url)
    const code = requestUrl.searchParams.get('code')

    // Log for debugging
    console.log('Auth callback received:', {
        url: request.url,
        code: code ? 'present' : 'missing'
    })

    if (code) {
        try {
            const supabase = await createClient()
            const { error } = await supabase.auth.exchangeCodeForSession(code)

            if (error) {
                console.error('Error exchanging code:', error)
                // Redirect to login with error
                return NextResponse.redirect(
                    new URL('/login?error=confirmation_failed', request.url)
                )
            }
        } catch (error) {
            console.error('Exception in auth callback:', error)
            return NextResponse.redirect(
                new URL('/login?error=server_error', request.url)
            )
        }
    }

    // Successful confirmation - redirect to wish page
    return NextResponse.redirect(new URL('/wish?confirmed=true', request.url))
}