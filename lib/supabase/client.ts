import { createBrowserClient } from '@supabase/ssr'
import { User } from '@supabase/supabase-js'

export const createClient = () => {
    return createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )
}

// This export MUST be present
export const getCurrentUser = async (): Promise<User | null> => {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    return user
}

// Keep this if you still need it
export const getSessionId = (): string => {
    if (typeof window === 'undefined') return ''

    let sessionId = sessionStorage.getItem('wisher_session_id')
    if (!sessionId) {
        sessionId = Math.random().toString(36).substring(2) + Date.now().toString(36)
        sessionStorage.setItem('wisher_session_id', sessionId)
    }
    return sessionId
}