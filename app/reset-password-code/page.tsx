'use client';

import { Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { ArrowLeft, Mail, Lock, Loader2 } from 'lucide-react';

// Separate component that uses useSearchParams
function ResetPasswordCodeForm() {
    const [code, setCode] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [message, setMessage] = useState('');
    const [step, setStep] = useState<'code' | 'password'>('code');

    const router = useRouter();
    const searchParams = useSearchParams();
    const email = searchParams.get('email') || '';
    const supabase = createClient();

    const handleVerifyCode = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!code || code.length !== 6) {
            setError('Please enter the 6-digit code');
            return;
        }

        setLoading(true);
        setError('');
        setMessage('');

        try {
            console.log('🔐 Verifying code for:', email);

            const { error } = await supabase.auth.verifyOtp({
                email,
                token: code,
                type: 'recovery'
            });

            if (error) throw error;

            setMessage('Code verified! Please enter your new password.');
            setStep('password');
        } catch (error: any) {
            console.error('Verification error:', error);
            setError(error.message || 'Invalid or expired code');
        } finally {
            setLoading(false);
        }
    };

    const handleResetPassword = async (e: React.FormEvent) => {
        e.preventDefault();

        if (newPassword !== confirmPassword) {
            setError('Passwords do not match');
            return;
        }

        if (newPassword.length < 6) {
            setError('Password must be at least 6 characters');
            return;
        }

        setLoading(true);
        setError('');
        setMessage('');

        try {
            const { error } = await supabase.auth.updateUser({
                password: newPassword
            });

            if (error) throw error;

            setMessage('Password updated! Redirecting to login...');

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
                        {step === 'code' ? 'Enter Reset Code' : 'New Password'}
                    </h1>

                    {step === 'code' ? (
                        <>
                            <p className="text-center text-gray-600 mb-6">
                                Enter the 6-digit code sent to<br />
                                <span className="font-semibold">{email}</span>
                            </p>

                            <form onSubmit={handleVerifyCode} className="space-y-5">
                                <div>
                                    <input
                                        type="text"
                                        value={code}
                                        onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                                        className="w-full px-4 py-3 text-center text-2xl tracking-widest border-2 rounded-xl focus:outline-none transition-colors"
                                        style={{ borderColor: '#A7C7E7' }}
                                        placeholder="000000"
                                        required
                                        maxLength={6}
                                    />
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
                                    disabled={loading || code.length !== 6}
                                    className="w-full py-4 rounded-xl text-white font-bold text-lg transition-all transform hover:scale-105 disabled:opacity-50 flex items-center justify-center gap-2"
                                    style={{ backgroundColor: '#d45673ff' }}
                                >
                                    {loading ? (
                                        <>
                                            <Loader2 size={20} className="animate-spin" />
                                            Verifying...
                                        </>
                                    ) : (
                                        'Verify Code'
                                    )}
                                </button>
                            </form>
                        </>
                    ) : (
                        <>
                            <p className="text-center text-gray-600 mb-6">
                                Enter your new password below
                            </p>

                            <form onSubmit={handleResetPassword} className="space-y-5">
                                <div>
                                    <label className="block text-sm font-medium text-gray-800 mb-2">
                                        New Password *
                                    </label>
                                    <input
                                        type="password"
                                        value={newPassword}
                                        onChange={(e) => setNewPassword(e.target.value)}
                                        className="w-full px-4 py-3 border-2 rounded-xl focus:outline-none transition-colors text-gray-900"
                                        style={{ borderColor: '#A7C7E7' }}
                                        placeholder="Enter new password"
                                        required
                                        minLength={6}
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-800 mb-2">
                                        Confirm New Password *
                                    </label>
                                    <input
                                        type="password"
                                        value={confirmPassword}
                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                        className="w-full px-4 py-3 border-2 rounded-xl focus:outline-none transition-colors text-gray-900"
                                        style={{ borderColor: '#A7C7E7' }}
                                        placeholder="Confirm new password"
                                        required
                                    />
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
                                    disabled={loading}
                                    className="w-full py-4 rounded-xl text-white font-bold text-lg transition-all transform hover:scale-105 disabled:opacity-50"
                                    style={{ backgroundColor: '#d45673ff' }}
                                >
                                    {loading ? 'Resetting...' : 'Reset Password'}
                                </button>
                            </form>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}

// Main page component with Suspense
export default function ResetPasswordCodePage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pastel-pink"></div>
            </div>
        }>
            <ResetPasswordCodeForm />
        </Suspense>
    );
}