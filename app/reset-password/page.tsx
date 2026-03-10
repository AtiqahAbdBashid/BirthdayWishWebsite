'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Lock, ArrowLeft, Eye, EyeOff } from 'lucide-react';
import Link from 'next/link';

export default function ResetPasswordPage() {
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [message, setMessage] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [passwordMatch, setPasswordMatch] = useState(true);
    const [isValidSession, setIsValidSession] = useState(false);
    const [checking, setChecking] = useState(true);

    const router = useRouter();
    const supabase = createClient();

    useEffect(() => {
        const handleResetPassword = async () => {
            try {
                console.log('1. Reset page mounted');
                console.log('2. Full URL:', window.location.href);
                console.log('3. Hash:', window.location.hash);

                // Check if there's a session first
                const { data: { session } } = await supabase.auth.getSession();
                console.log('4. Existing session:', session);

                if (session) {
                    console.log('5. Session found - user is authenticated');
                    setIsValidSession(true);
                    setChecking(false);
                    return;
                }

                // Check URL for tokens
                const hashParams = new URLSearchParams(window.location.hash.substring(1));
                const accessToken = hashParams.get('access_token');
                const refreshToken = hashParams.get('refresh_token');
                const type = hashParams.get('type');

                console.log('6. URL tokens:', { accessToken, refreshToken, type });

                if (accessToken && type === 'recovery') {
                    console.log('7. Recovery token found, setting session...');

                    // Set the session with the tokens
                    const { error: sessionError } = await supabase.auth.setSession({
                        access_token: accessToken,
                        refresh_token: refreshToken || '',
                    });

                    if (sessionError) {
                        console.error('8. Session error:', sessionError);
                        setError('Invalid or expired reset link. Please request a new one.');
                        setTimeout(() => router.push('/login'), 3000);
                    } else {
                        console.log('9. Session set successfully');
                        setIsValidSession(true);
                    }
                } else {
                    console.log('10. No valid recovery token found');
                    setError('Invalid or expired reset link. Please request a new one.');
                    setTimeout(() => router.push('/login'), 3000);
                }
            } catch (err) {
                console.error('11. Unexpected error:', err);
                setError('An error occurred. Please try again.');
                setTimeout(() => router.push('/login'), 3000);
            } finally {
                setChecking(false);
            }
        };

        handleResetPassword();
    }, [router, supabase]);

    // Check password match
    useEffect(() => {
        if (confirmPassword) {
            setPasswordMatch(password === confirmPassword);
        } else {
            setPasswordMatch(true);
        }
    }, [password, confirmPassword]);

    const handleResetPassword = async (e: React.FormEvent) => {
        e.preventDefault();

        if (password !== confirmPassword) {
            setError('Passwords do not match');
            return;
        }

        if (password.length < 6) {
            setError('Password must be at least 6 characters');
            return;
        }

        setLoading(true);
        setError('');
        setMessage('');

        try {
            const { error } = await supabase.auth.updateUser({
                password: password
            });

            if (error) throw error;

            setMessage('Password updated successfully! Redirecting to login...');

            // Sign out after password reset
            await supabase.auth.signOut();

            setTimeout(() => {
                router.push('/login');
            }, 2000);
        } catch (error: any) {
            console.error('Password update error:', error);
            setError(error.message || 'Failed to reset password');
        } finally {
            setLoading(false);
        }
    };

    if (checking) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-pastel-pink/20 via-pastel-blue/20 to-pastel-yellow/20">
                <div className="bg-white/80 backdrop-blur-sm p-8 rounded-2xl shadow-xl">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pastel-pink mx-auto"></div>
                    <p className="text-center mt-4 text-gray-600">Verifying your link...</p>
                </div>
            </div>
        );
    }

    if (!isValidSession && !checking) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-pastel-pink/20 via-pastel-blue/20 to-pastel-yellow/20 p-4 flex items-center justify-center">
                <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-8 max-w-md text-center">
                    <h2 className="text-2xl font-bold text-red-500 mb-4">Link Expired or Invalid</h2>
                    <p className="text-gray-600 mb-6">This password reset link is no longer valid. Please request a new one.</p>
                    <Link
                        href="/login"
                        className="inline-block px-6 py-3 bg-pastel-pink text-white rounded-lg hover:scale-105 transition-transform"
                    >
                        Go to Login
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-pastel-pink/20 via-pastel-blue/20 to-pastel-yellow/20 p-4">
            <div className="max-w-md mx-auto pt-8">
                <Link
                    href="/login"
                    className="inline-flex items-center gap-2 text-gray-600 hover:text-pastel-pink mb-6 transition-colors"
                >
                    <ArrowLeft size={20} />
                    Back to Login
                </Link>

                <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-6 md:p-8">
                    <h1 className="text-3xl font-bold text-center mb-2" style={{ color: '#d45673ff' }}>
                        Reset Password 🔐
                    </h1>
                    <p className="text-center text-gray-600 mb-6">
                        Enter your new password below
                    </p>

                    <form onSubmit={handleResetPassword} className="space-y-5">
                        <div>
                            <label className="block text-sm font-medium text-gray-800 mb-2">
                                New Password *
                            </label>
                            <div className="relative">
                                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500" size={18} />
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="w-full pl-10 pr-12 py-3 border-2 rounded-xl focus:outline-none transition-colors text-gray-900"
                                    style={{ borderColor: '#A7C7E7' }}
                                    placeholder="Enter new password"
                                    required
                                    minLength={6}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                                >
                                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                                </button>
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-800 mb-2">
                                Confirm New Password *
                            </label>
                            <div className="relative">
                                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500" size={18} />
                                <input
                                    type={showConfirmPassword ? 'text' : 'password'}
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    className={`w-full pl-10 pr-12 py-3 border-2 rounded-xl focus:outline-none transition-colors text-gray-900 ${!passwordMatch && confirmPassword ? 'border-red-500' : ''
                                        }`}
                                    style={{ borderColor: !passwordMatch && confirmPassword ? '#ef4444' : '#A7C7E7' }}
                                    placeholder="Confirm new password"
                                    required
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                                >
                                    {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                                </button>
                            </div>
                            {!passwordMatch && confirmPassword && (
                                <p className="text-xs text-red-500 mt-1">Passwords do not match</p>
                            )}
                            {passwordMatch && confirmPassword && password.length >= 6 && (
                                <p className="text-xs text-green-500 mt-1">✓ Passwords match</p>
                            )}
                        </div>

                        {error && (
                            <div className="bg-red-100 border border-red-300 text-red-700 p-3 rounded-xl text-sm">
                                {error}
                            </div>
                        )}

                        {message && (
                            <div className="bg-green-100 border border-green-300 text-green-700 p-3 rounded-xl text-sm">
                                {message}
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={loading || !passwordMatch}
                            className="w-full py-4 rounded-xl text-white font-bold text-lg transition-all transform hover:scale-105 disabled:opacity-50"
                            style={{ backgroundColor: '#d45673ff' }}
                        >
                            {loading ? 'Resetting...' : 'Reset Password'}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}