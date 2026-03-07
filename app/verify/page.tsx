'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import { ArrowLeft, Mail, CheckCircle, Loader2 } from 'lucide-react';

export default function VerifyPage() {
    const [email, setEmail] = useState('');
    const [token, setToken] = useState('');
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);

    const router = useRouter();
    const searchParams = useSearchParams();
    const emailParam = searchParams.get('email');
    const supabase = createClient();

    useEffect(() => {
        if (emailParam) {
            setEmail(emailParam);
        }
    }, [emailParam]);

    const handleVerify = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        setMessage('');

        try {
            const { data, error } = await supabase.auth.verifyOtp({
                email,
                token,
                type: 'email'
            });

            if (error) throw error;

            setSuccess(true);
            setMessage('Email confirmed successfully! Redirecting...');

            setTimeout(() => {
                router.push('/wish');
            }, 2000);
        } catch (error: any) {
            setError(error.message || 'Failed to verify email');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-pastel-pink/20 via-pastel-blue/20 to-pastel-yellow/20 p-4">
            <div className="max-w-md mx-auto pt-8">
                <Link
                    href="/"
                    className="inline-flex items-center gap-2 text-gray-600 hover:text-pastel-pink mb-6 transition-colors"
                >
                    <ArrowLeft size={20} />
                    Back to Home
                </Link>

                <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-6 md:p-8">
                    <h1 className="text-3xl font-bold text-center mb-2" style={{ color: '#d45673ff' }}>
                        Verify Your Email ✉️
                    </h1>
                    <p className="text-center text-gray-600 mb-6">
                        Enter the 6-digit code sent to your email
                    </p>

                    {success ? (
                        <div className="bg-green-100 border border-green-300 text-green-700 p-4 rounded-xl text-center">
                            <CheckCircle className="mx-auto mb-2" size={40} />
                            <p>{message}</p>
                        </div>
                    ) : (
                        <form onSubmit={handleVerify} className="space-y-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-800 mb-2">
                                    Email Address
                                </label>
                                <div className="relative">
                                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500" size={18} />
                                    <input
                                        type="email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        className="w-full pl-10 pr-4 py-3 border-2 rounded-xl focus:outline-none transition-colors text-gray-900"
                                        style={{ borderColor: '#A7C7E7' }}
                                        placeholder="your@email.com"
                                        required
                                        readOnly={!!emailParam}
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-800 mb-2">
                                    Verification Code
                                </label>
                                <input
                                    type="text"
                                    value={token}
                                    onChange={(e) => setToken(e.target.value.replace(/\D/g, '').slice(0, 6))}
                                    className="w-full px-4 py-3 border-2 rounded-xl focus:outline-none transition-colors text-center text-2xl tracking-widest text-gray-900"
                                    style={{ borderColor: '#A7C7E7' }}
                                    placeholder="000000"
                                    required
                                    maxLength={6}
                                />
                                <p className="text-xs text-gray-500 mt-1">
                                    Enter the 6-digit code from your email
                                </p>
                            </div>

                            {error && (
                                <div className="bg-red-100 border border-red-300 text-red-700 p-3 rounded-xl text-sm">
                                    {error}
                                </div>
                            )}

                            {message && !success && (
                                <div className="bg-green-100 border border-green-300 text-green-700 p-3 rounded-xl text-sm">
                                    {message}
                                </div>
                            )}

                            <button
                                type="submit"
                                disabled={loading || token.length !== 6}
                                className="w-full py-4 rounded-xl text-white font-bold text-lg transition-all transform hover:scale-105 disabled:opacity-50 flex items-center justify-center gap-2"
                                style={{ backgroundColor: '#d45673ff' }}
                            >
                                {loading ? (
                                    <>
                                        <Loader2 size={20} className="animate-spin" />
                                        Verifying...
                                    </>
                                ) : (
                                    'Verify Email'
                                )}
                            </button>

                            <div className="text-center">
                                <button
                                    type="button"
                                    onClick={() => {
                                        // Implement resend logic here
                                    }}
                                    className="text-sm text-pastel-blue hover:underline"
                                    style={{ color: '#3a84ceff' }}
                                >
                                    Didn't receive code? Resend
                                </button>
                            </div>
                        </form>
                    )}
                </div>
            </div>
        </div>
    );
}