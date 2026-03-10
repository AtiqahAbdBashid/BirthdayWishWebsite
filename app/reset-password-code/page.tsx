'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import { ArrowLeft, Mail, Lock, Loader2 } from 'lucide-react';

export default function ResetPasswordCodePage() {
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

        try {
            // Verify the OTP code
            const { error } = await supabase.auth.verifyOtp({
                email,
                token: code,
                type: 'recovery'
            });

            if (error) throw error;

            setStep('password');
            setMessage('Code verified! Please enter your new password.');
        } catch (error: any) {
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

        try {
            const { error } = await supabase.auth.updateUser({
                password: newPassword
            });

            if (error) throw error;

            setMessage('Password updated! Redirecting to login...');
            setTimeout(() => router.push('/login'), 2000);
        } catch (error: any) {
            setError(error.message || 'Failed to reset password');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-pastel-pink/20 via-pastel-blue/20 to-pastel-yellow/20 p-4">
            <div className="max-w-md mx-auto pt-8">
                <Link href="/login" className="inline-flex items-center gap-2 text-gray-600 hover:text-pastel-pink mb-6">
                    <ArrowLeft size={20} /> Back to Login
                </Link>

                <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-6 md:p-8">
                    <h1 className="text-3xl font-bold text-center mb-2" style={{ color: '#d45673ff' }}>
                        {step === 'code' ? 'Enter Reset Code' : 'New Password'}
                    </h1>

                    {step === 'code' ? (
                        <form onSubmit={handleVerifyCode} className="space-y-5">
                            <p className="text-center text-gray-600 mb-4">
                                Enter the 6-digit code sent to {email}
                            </p>
                            <div>
                                <input
                                    type="text"
                                    value={code}
                                    onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                                    className="w-full px-4 py-3 text-center text-2xl tracking-widest border-2 rounded-xl"
                                    style={{ borderColor: '#A7C7E7' }}
                                    placeholder="000000"
                                    required
                                />
                            </div>
                            {error && <p className="text-red-500 text-sm text-center">{error}</p>}
                            {message && <p className="text-green-600 text-sm text-center">{message}</p>}
                            <button
                                type="submit"
                                disabled={loading || code.length !== 6}
                                className="w-full py-3 rounded-xl text-white font-semibold disabled:opacity-50"
                                style={{ backgroundColor: '#d45673ff' }}
                            >
                                {loading ? 'Verifying...' : 'Verify Code'}
                            </button>
                        </form>
                    ) : (
                        <form onSubmit={handleResetPassword} className="space-y-5">
                            <div>
                                <label className="block text-sm font-medium text-gray-800 mb-2">New Password</label>
                                <input
                                    type="password"
                                    value={newPassword}
                                    onChange={(e) => setNewPassword(e.target.value)}
                                    className="w-full px-4 py-3 border-2 rounded-xl"
                                    style={{ borderColor: '#A7C7E7' }}
                                    placeholder="Enter new password"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-800 mb-2">Confirm Password</label>
                                <input
                                    type="password"
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    className="w-full px-4 py-3 border-2 rounded-xl"
                                    style={{ borderColor: '#A7C7E7' }}
                                    placeholder="Confirm new password"
                                    required
                                />
                            </div>
                            {error && <p className="text-red-500 text-sm text-center">{error}</p>}
                            {message && <p className="text-green-600 text-sm text-center">{message}</p>}
                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full py-3 rounded-xl text-white font-semibold"
                                style={{ backgroundColor: '#d45673ff' }}
                            >
                                {loading ? 'Resetting...' : 'Reset Password'}
                            </button>
                        </form>
                    )}
                </div>
            </div>
        </div>
    );
}