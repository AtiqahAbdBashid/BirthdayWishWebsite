import { NextResponse } from 'next/server';

const CORRECT_PASSWORD = process.env.SITE_PASSWORD || 'Lynda1203@2026';

// Force no caching for this API route
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function POST(request: Request) {
    try {
        const { password } = await request.json();

        // Debug - this will show in Vercel logs
        console.log('========== AUTH DEBUG ==========');
        console.log('Environment variables available:', Object.keys(process.env).filter(key => key.includes('PASSWORD')));
        console.log('SITE_PASSWORD value:', process.env.SITE_PASSWORD);
        console.log('Final password used:', CORRECT_PASSWORD);
        console.log('Password from request:', password);
        console.log('Match result:', password?.trim() === CORRECT_PASSWORD);
        console.log('================================');

        if (password?.trim() === CORRECT_PASSWORD) {
            return NextResponse.json({ success: true });
        } else {
            return NextResponse.json(
                { success: false, error: 'Wrong password' },
                { status: 401 }
            );
        }
    } catch (error) {
        console.error('Auth error:', error);
        return NextResponse.json(
            { success: false, error: 'Server error' },
            { status: 500 }
        );
    }
}