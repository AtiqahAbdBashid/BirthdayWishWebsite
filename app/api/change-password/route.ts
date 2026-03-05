import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function POST(request: Request) {
    try {
        const { currentPassword, newPassword } = await request.json();

        const passwordPath = path.join(process.cwd(), 'app', 'api', 'auth', 'password.txt');
        const correctPassword = fs.readFileSync(passwordPath, 'utf8').trim();

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
                { success: false, error: 'New password must be at least 6 characters' },
                { status: 400 }
            );
        }

        // Save new password to file
        fs.writeFileSync(passwordPath, newPassword);

        return NextResponse.json({
            success: true,
            message: 'Password changed successfully'
        });

    } catch (error) {
        return NextResponse.json(
            { success: false, error: 'Server error' },
            { status: 500 }
        );
    }
}