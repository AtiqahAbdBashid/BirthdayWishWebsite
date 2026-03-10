'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '../../lib/supabase/client';
import { ArrowLeft, Mail, Lock, Loader2, Eye, EyeOff } from 'lucide-react';

// Main page component
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

// Login form component
function LoginForm() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [name, setName] = useState('');
    const [loading, setLoading] = useState(false);
    const [isLogin, setIsLogin] = useState(true);
    const [error, setError] = useState('');
    const [message, setMessage] = useState('');
    const [showConfirmed, setShowConfirmed] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [passwordMatch, setPasswordMatch] = useState(true);

    const router = useRouter();
    const searchParams = useSearchParams();
    const redirectTo = searchParams.get('redirect') || '/wish';
    const confirmed = searchParams.get('confirmed') === 'true';
    const errorParam = searchParams.get('error');
    const supabase = createClient();

    // Check password match on signup
    useEffect(() => {
        if (!isLogin && confirmPassword) {
            setPasswordMatch(password === confirmPassword);
        } else {
            setPasswordMatch(true);
        }
    }, [password, confirmPassword, isLogin]);

    // Set confirmed message from URL
    useEffect(() => {
        if (confirmed) {
            setShowConfirmed(true);
            setTimeout(() => setShowConfirmed(false), 5000);
        }
    }, [confirmed]);

    // Set error from URL param if present
    useEffect(() => {
        if (errorParam) {
            if (errorParam === 'expired') {
                setError('expired');
            } else if (errorParam === 'confirmation_failed') {
                setError('confirmation_failed');
            } else {
                setError('unknown');
            }
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

    const handleForgotPassword = async () => {
        if (!email) {
            setError('Please enter your email address first');
            return;
        }

        setLoading(true);
        setError('');
        setMessage('');

        try {
            // Debug logging
            console.log('🔐 FORGOT PASSWORD DEBUG:');
            console.log('Email:', email);
            console.log('Origin:', window.location.origin);

            const redirectUrl = `${window.location.origin}/reset-password`;
            console.log('Redirect URL:', redirectUrl);

            const { error } = await supabase.auth.resetPasswordForEmail(email, {
                redirectTo: redirectUrl,
            });

            console.log('Supabase response:', { error });

            if (error) throw error;

            setMessage('Password reset link sent! Check your email (including spam).');
        } catch (error: any) {
            console.error('Reset error:', error);
            setError(error.message || 'Failed to send reset email');
        } finally {
            setLoading(false);
        }
    };

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

        // Validate passwords match
        if (password !== confirmPassword) {
            setError('Passwords do not match');
            return;
        }

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
                    emailRedirectTo: `${window.location.origin}/verify?email=${encodeURIComponent(email)}`,
                },
            });

            if (error) throw error;

            setMessage('Check your email for the verification code!');
            setEmail('');
            setPassword('');
            setConfirmPassword('');
            setName('');

            // Redirect to verify page
            setTimeout(() => {
                router.push(`/verify?email=${encodeURIComponent(email)}`);
            }, 2000);
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
                    <label className="block text-sm font-medium text-gray-800 mb-2">
                        Your Name *
                    </label>
                    <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="w-full px-4 py-3 border-2 rounded-xl focus:outline-none transition-colors text-gray-900 placeholder-gray-500"
                        style={{ borderColor: '#A7C7E7' }}
                        placeholder="Enter your name"
                        required
                    />
                </div>
            )}

            <div>
                <label className="block text-sm font-medium text-gray-800 mb-2">
                    Email *
                </label>
                <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500" size={18} />
                    <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full pl-10 pr-4 py-3 border-2 rounded-xl focus:outline-none transition-colors text-gray-900 placeholder-gray-500"
                        style={{ borderColor: '#A7C7E7' }}
                        placeholder="your@email.com"
                        required
                    />
                </div>
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-800 mb-2">
                    Password *
                </label>
                <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500" size={18} />
                    <input
                        type={showPassword ? 'text' : 'password'}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full pl-10 pr-12 py-3 border-2 rounded-xl focus:outline-none transition-colors text-gray-900 placeholder-gray-500"
                        style={{ borderColor: '#A7C7E7' }}
                        placeholder={isLogin ? 'Enter your password' : 'Create password (min 6 characters)'}
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

                {isLogin && (
                    <div className="text-right mt-2">
                        <button
                            type="button"
                            onClick={handleForgotPassword}
                            className="text-sm text-pastel-blue hover:underline"
                            style={{ color: '#3a84ceff' }}
                        >
                            Forgot password?
                        </button>
                    </div>
                )}
            </div>

            {/* Password confirmation for signup */}
            {!isLogin && (
                <div>
                    <label className="block text-sm font-medium text-gray-800 mb-2">
                        Confirm Password *
                    </label>
                    <div className="relative">
                        <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500" size={18} />
                        <input
                            type={showConfirmPassword ? 'text' : 'password'}
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            className={`w-full pl-10 pr-12 py-3 border-2 rounded-xl focus:outline-none transition-colors text-gray-900 placeholder-gray-500 ${!passwordMatch && confirmPassword ? 'border-red-500' : ''
                                }`}
                            style={{ borderColor: !passwordMatch && confirmPassword ? '#ef4444' : '#A7C7E7' }}
                            placeholder="Confirm your password"
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
                    <p className="text-xs text-gray-600 mt-1">Password must be at least 6 characters</p>
                </div>
            )}

            {error && (
                <div className="bg-red-100 border border-red-300 text-red-700 p-4 rounded-xl text-sm">
                    {error === 'Invalid login credentials' && (
                        <p>❌ Invalid email or password. Please try again.</p>
                    )}
                    {error === 'Email not confirmed' && (
                        <p>📧 Please check your email and confirm your account before logging in.</p>
                    )}
                    {error === 'expired' && (
                        <div>
                            <p className="font-medium">🔗 Link Expired</p>
                            <p className="mt-1">The confirmation link has expired. Please sign up again to receive a new confirmation email.</p>
                        </div>
                    )}
                    {error === 'confirmation_failed' && (
                        <div>
                            <p className="font-medium">❌ Confirmation Failed</p>
                            <p className="mt-1">We couldn't confirm your email. Please try signing up again.</p>
                        </div>
                    )}
                    {error === 'Passwords do not match' && (
                        <p>❌ {error}</p>
                    )}
                    {error === 'unknown' && (
                        <div>
                            <p className="font-medium">❓ Unknown Error</p>
                            <p className="mt-1">An unexpected error occurred. Please try again.</p>
                        </div>
                    )}
                    {error && !['Invalid login credentials', 'Email not confirmed', 'expired', 'confirmation_failed', 'unknown', 'Passwords do not match'].includes(error) && (
                        <p>{error}</p>
                    )}
                </div>
            )}

            {message && (
                <div className="bg-green-100 border border-green-300 text-green-700 p-4 rounded-xl text-sm">
                    {message}
                </div>
            )}

            {showConfirmed && (
                <div className="bg-green-100 border border-green-300 text-green-700 p-4 rounded-xl text-sm">
                    ✓ Email confirmed successfully! You can now log in.
                </div>
            )}

            <button
                type="submit"
                disabled={loading || (!isLogin && !passwordMatch)}
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
                        setPassword('');
                        setConfirmPassword('');
                        setShowPassword(false);
                        setShowConfirmPassword(false);
                    }}
                    className="text-sm text-pastel-blue hover:underline"
                    style={{ color: '#3a84ceff' }}
                >
                    {isLogin ? "Don't have an account? Sign up" : "Already have an account? Log in"}
                </button>
            </div>
        </form>
    );
}