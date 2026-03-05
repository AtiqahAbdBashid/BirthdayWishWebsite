import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function POST(request: Request) {
    try {
        const { password } = await request.json();

        // Read current password from file
        const passwordPath = path.join(process.cwd(), 'app', 'api', 'auth', 'password.txt');
        const correctPassword = fs.readFileSync(passwordPath, 'utf8').trim();

        if (password?.trim() === correctPassword) {
            return NextResponse.json({ success: true });
        } else {
            return NextResponse.json(
                { success: false, error: 'Wrong password' },
                { status: 401 }
            );
        }
    } catch (error) {
        return NextResponse.json(
            { success: false, error: 'Server error' },
            { status: 500 }
        );
    }
}