'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Save } from 'lucide-react';
import Link from 'next/link';

export default function ChangePasswordPage() {
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    // Check if user is authenticated to access this page
    useEffect(() => {
        const auth = sessionStorage.getItem('lyndaAuth');
        if (!auth) {
            router.push('/');
        }
    }, [router]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setSuccess('');

        // Validate passwords
        if (newPassword.length < 6) {
            setError('Password must be at least 6 characters');
            return;
        }

        if (newPassword !== confirmPassword) {
            setError('New passwords do not match');
            return;
        }

        setLoading(true);

        try {
            const res = await fetch('/api/change-password', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    currentPassword,
                    newPassword,
                }),
            });

            const data = await res.json();

            if (data.success) {
                setSuccess('Password changed successfully!');
                setCurrentPassword('');
                setNewPassword('');
                setConfirmPassword('');

                // Update session storage with password changed note
                sessionStorage.setItem('passwordChanged', 'true');

                // Redirect to dashboard after 2 seconds
                setTimeout(() => {
                    router.push('/dashboard');
                }, 2000);
            } else {
                setError(data.error || 'Failed to change password');
            }
        } catch (err) {
            setError('Something went wrong');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-pastel-pink/20 via-pastel-blue/20 to-pastel-yellow/20 p-4">
            <div className="max-w-md mx-auto pt-8">
                <Link
                    href="/dashboard"
                    className="inline-flex items-center gap-2 text-gray-600 hover:text-pastel-pink mb-6 transition-colors"
                >
                    <ArrowLeft size={20} />
                    Back to Dashboard
                </Link>

                <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-6 md:p-8">
                    <h1 className="text-3xl font-bold text-center mb-2" style={{ color: '#d45673ff' }}>
                        Change Password 🔐
                    </h1>
                    <p className="text-center text-gray-600 mb-6">
                        Update your password to keep your wishes safe
                    </p>

                    <form onSubmit={handleSubmit} className="space-y-5">
                        {/* Current Password */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Current Password
                            </label>
                            <input
                                type="password"
                                value={currentPassword}
                                onChange={(e) => setCurrentPassword(e.target.value)}
                                className="w-full px-4 py-3 border-2 rounded-xl focus:outline-none transition-colors"
                                style={{ borderColor: '#A7C7E7', color: '#d45673ff' }}
                                placeholder="Enter current password"
                                required
                            />
                        </div>

                        {/* New Password */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                New Password
                            </label>
                            <input
                                type="password"
                                value={newPassword}
                                onChange={(e) => setNewPassword(e.target.value)}
                                className="w-full px-4 py-3 border-2 rounded-xl focus:outline-none transition-colors"
                                style={{ borderColor: '#A7C7E7', color: '#d45673ff' }}
                                placeholder="Enter new password (min 6 characters)"
                                required
                            />
                        </div>

                        {/* Confirm New Password */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Confirm New Password
                            </label>
                            <input
                                type="password"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                className="w-full px-4 py-3 border-2 rounded-xl focus:outline-none transition-colors"
                                style={{ borderColor: '#A7C7E7', color: '#d45673ff' }}
                                placeholder="Confirm new password"
                                required
                            />
                        </div>

                        {/* Error/Success Messages */}
                        {error && (
                            <div className="bg-red-50 text-red-500 p-3 rounded-xl text-sm">
                                {error}
                            </div>
                        )}

                        {success && (
                            <div className="bg-green-50 text-green-600 p-3 rounded-xl text-sm">
                                {success}
                            </div>
                        )}

                        {/* Submit Button */}
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full py-4 rounded-xl text-white font-bold text-lg transition-all transform hover:scale-105 disabled:opacity-50 flex items-center justify-center gap-2"
                            style={{ backgroundColor: '#d45673ff' }}
                        >
                            <Save size={20} />
                            {loading ? 'Changing...' : 'Change Password'}
                        </button>
                    </form>

                    <p className="text-xs text-gray-400 text-center mt-4">
                        After changing your password, remember to use it next time!
                    </p>
                </div>
            </div>
        </div>
    );
}