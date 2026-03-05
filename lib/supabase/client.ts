import { createBrowserClient } from '@supabase/ssr';

// ⚠️ IMPORTANT: Make sure your .env.local file has these values!
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const createClient = () => {
    return createBrowserClient(supabaseUrl, supabaseAnonKey);
};

// Helper to generate a simple session ID for anonymous users
export const getSessionId = () => {
    if (typeof window === 'undefined') return '';

    let sessionId = sessionStorage.getItem('wisher_session_id');
    if (!sessionId) {
        sessionId = Math.random().toString(36).substring(2) + Date.now().toString(36);
        sessionStorage.setItem('wisher_session_id', sessionId);
    }
    return sessionId;
};