import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export const createClient = async () => {
    const cookieStore = await cookies()

    return createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                async get(name: string) {
                    const cookieStore = await cookies()
                    return cookieStore.get(name)?.value
                },
                async set(name: string, value: string, options: any) {
                    try {
                        const cookieStore = await cookies()
                        cookieStore.set({ name, value, ...options })
                    } catch (error) {
                        // Handle cookie errors
                    }
                },
                async remove(name: string, options: any) {
                    try {
                        const cookieStore = await cookies()
                        cookieStore.set({ name, value: '', ...options })
                    } catch (error) {
                        // Handle cookie errors
                    }
                },
            },
        }
    )
}

// Helper to get current user on server side
export const getCurrentUser = async () => {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    return user
}