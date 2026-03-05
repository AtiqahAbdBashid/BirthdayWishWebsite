'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { X } from 'lucide-react';

interface Props {
    onClose: () => void;
}

export default function PasswordPopup({ onClose }: Props) {
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            // Trim the password to remove any accidental spaces
            const trimmedPassword = password.trim();

            console.log('Sending password:', trimmedPassword); // For debugging

            const res = await fetch('/api/auth', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ password: trimmedPassword }),
            });

            const data = await res.json();

            if (data.success) {
                // Store auth state in session
                sessionStorage.setItem('lyndaAuth', 'true');
                router.push('/dashboard');
            } else {
                setError('Wrong password! Try again 🎂');
                setPassword(''); // Clear the password field
            }
        } catch (err) {
            setError('Something went wrong. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl p-8 max-w-md w-full relative">
                {/* Close button */}
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
                >
                    <X size={24} />
                </button>

                <h2 className="text-3xl font-bold mb-2 text-center" style={{ color: '#cb7d8fff' }}>
                    🎀  Secret Surprise  🎀
                </h2>
                <p className="text-center text-gray-600 mb-6">
                    Enter the password to view your birthday surprise
                </p>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="Enter password..."
                            className="w-full px-4 py-3 border-2 rounded-xl 
               focus:outline-none focus:border-pastel-pink text-center text-lg
               transition-colors placeholder:text-gray-600 text-gray-800"
                            style={{ borderColor: '#A7C7E7' }}
                            autoFocus
                        />
                    </div>

                    {error && (
                        <p className="text-red-500 text-sm text-center">{error}</p>
                    )}

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full py-3 rounded-xl text-white font-bold text-lg
                     transition-all transform hover:scale-105 disabled:opacity-50
                     disabled:hover:scale-100"
                        style={{ backgroundColor: '#cb7d8fff' }}
                    >
                        {loading ? 'Checking...' : '✨ Open Surprise ✨'}
                    </button>
                </form>

                {/* ⚠️ CUSTOMIZE THIS: Add a hint if you want */}
                <p className="text-xs text-gray-400 text-center mt-4">
                    Hint: If you're Lynda, you'll know...
                </p>
            </div>
        </div>
    );
}