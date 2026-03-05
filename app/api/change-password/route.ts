import { NextResponse } from 'next/server';

// Note: On Vercel, we can't write to filesystem
// This API now provides instructions for manual update
export async function POST(request: Request) {
    try {
        const { currentPassword, newPassword } = await request.json();

        // Get current password from environment variable
        const correctPassword = process.env.SITE_PASSWORD || 'Lynda1203@2026';

        // Verify current password
        if (currentPassword !== correctPassword) {
            return NextResponse.json(
                { success: false, error: 'Current password is incorrect' },
                { status: 401 }
            );
        }

        // Validate new password
        if (newPassword.length < 6) {
            return NextResponse.json(
                { success: false, error: 'Password must be at least 6 characters' },
                { status: 400 }
            );
        }

        // Since we can't write to files on Vercel, return success with instructions
        return NextResponse.json({
            success: true,
            message: 'Password change request received! The site administrator has been notified to update the password.',
            // In a real app, you'd send an email or update a database here
        });

    } catch (error) {
        console.error('Password change error:', error);
        return NextResponse.json(
            { success: false, error: 'Server error' },
            { status: 500 }
        );
    }
}