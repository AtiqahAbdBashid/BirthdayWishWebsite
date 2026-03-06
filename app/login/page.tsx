'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import { ArrowLeft, Mail, Lock, Loader2 } from 'lucide-react';

// Create a separate component that uses useSearchParams
function LoginForm() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [name, setName] = useState('');
    const [loading, setLoading] = useState(false);
    const [isLogin, setIsLogin] = useState(true);
    const [error, setError] = useState('');
    const [message, setMessage] = useState('');

    const router = useRouter();
    const searchParams = useSearchParams();
    const redirectTo = searchParams.get('redirect') || '/wish';
    const confirmed = searchParams.get('confirmed') === 'true';  // ✅ Get from URL
    const errorParam = searchParams.get('error');  // Optional
    const supabase = createClient();

    const [showConfirmed, setShowConfirmed] = useState(confirmed);  // ✅ Use it here

    // Optional: Set error from URL param if present
    useEffect(() => {
        if (errorParam) {
            setError(errorParam === 'confirmation_failed'
                ? 'Email confirmation failed. Please try again.'
                : 'An error occurred. Please try again.');
        }
    }, [errorParam]);

    // Check if user is already logged in
    useEffect(() => {
        const checkUser = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (user) {
                router.push('/wish');
            }
        };
        checkUser();
    }, [router, supabase]);

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        setMessage('');

        try {
            const { error } = await supabase.auth.signInWithPassword({
                email,
                password,
            });

            if (error) throw error;
            router.push(redirectTo);
        } catch (error: any) {
            setError(error.message || 'Failed to login');
        } finally {
            setLoading(false);
        }
    };

    const handleSignUp = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        setMessage('');

        if (!name.trim()) {
            setError('Please enter your name');
            setLoading(false);
            return;
        }

        try {
            const { error } = await supabase.auth.signUp({
                email,
                password,
                options: {
                    data: {
                        full_name: name,
                    },
                },
            });

            if (error) throw error;

            setMessage('Check your email for confirmation link!');
            setEmail('');
            setPassword('');
            setName('');
            setTimeout(() => setIsLogin(true), 3000);
        } catch (error: any) {
            setError(error.message || 'Failed to sign up');
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={isLogin ? handleLogin : handleSignUp} className="space-y-5">
            {!isLogin && (
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Your Name *
                    </label>
                    <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="w-full px-4 py-3 border-2 rounded-xl focus:outline-none transition-colors"
                        style={{ borderColor: '#A7C7E7' }}
                        placeholder="Enter your name"
                        required
                    />
                </div>
            )}

            <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email *
                </label>
                <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                    <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full pl-10 pr-4 py-3 border-2 rounded-xl focus:outline-none transition-colors"
                        style={{ borderColor: '#A7C7E7' }}
                        placeholder="your@email.com"
                        required
                    />
                </div>
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                    Password *
                </label>
                <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                    <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full pl-10 pr-4 py-3 border-2 rounded-xl focus:outline-none transition-colors"
                        style={{ borderColor: '#A7C7E7' }}
                        placeholder={isLogin ? 'Enter your password' : 'Create password (min 6 characters)'}
                        required
                        minLength={6}
                    />
                </div>
                {!isLogin && (
                    <p className="text-xs text-gray-500 mt-1">Password must be at least 6 characters</p>
                )}
            </div>

            {error && (
                <div className="bg-red-50 text-red-500 p-3 rounded-xl text-sm">
                    {error}
                </div>
            )}

            {message && (
                <div className="bg-green-50 text-green-600 p-3 rounded-xl text-sm">
                    {message}
                </div>
            )}

            {showConfirmed && (
                <div className="bg-green-50 text-green-600 p-3 rounded-xl text-sm">
                    ✓ Email confirmed successfully! You can now log in.
                </div>
            )}

            <button
                type="submit"
                disabled={loading}
                className="w-full py-4 rounded-xl text-white font-bold text-lg transition-all transform hover:scale-105 disabled:opacity-50 flex items-center justify-center gap-2"
                style={{ backgroundColor: '#d45673ff' }}
            >
                {loading ? (
                    <>
                        <Loader2 size={20} className="animate-spin" />
                        {isLogin ? 'Logging in...' : 'Creating account...'}
                    </>
                ) : (
                    isLogin ? 'Log In' : 'Sign Up'
                )}
            </button>

            <div className="text-center mt-4">
                <button
                    type="button"
                    onClick={() => {
                        setIsLogin(!isLogin);
                        setError('');
                        setMessage('');
                    }}
                    className="text-sm text-pastel-blue hover:underline"
                    style={{ color: '#A7C7E7' }}
                >
                    {isLogin ? "Don't have an account? Sign up" : "Already have an account? Log in"}
                </button>
            </div>
        </form>
    );
}

// Main page component with Suspense
export default function LoginPage() {
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
                        Welcome Back! 👋
                    </h1>
                    <p className="text-center text-gray-600 mb-6">
                        Login to view and manage your birthday wishes
                    </p>

                    <Suspense fallback={
                        <div className="flex justify-center items-center py-12">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-pastel-pink"></div>
                        </div>
                    }>
                        <LoginForm />
                    </Suspense>

                    <div className="mt-6 text-center">
                        <Link
                            href="/"
                            className="text-xs text-gray-400 hover:text-gray-600 transition-colors"
                        >
                            Return to homepage
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}