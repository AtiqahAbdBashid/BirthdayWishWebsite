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
    const confirmed = searchParams.get('confirmed') === 'true';
    const errorParam = searchParams.get('error');
    const messageParam = searchParams.get('message');
    const supabase = createClient();

    const [showConfirmed, setShowConfirmed] = useState(confirmed);

    useEffect(() => {
        if (errorParam) {
            setError(errorParam === 'confirmation_failed'
                ? 'Email confirmation failed. Please try again.'
                : 'An error occurred. Please try again.');
        }
    }, [errorParam]);

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
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full pl-10 pr-4 py-3 border-2 rounded-xl focus:outline-none transition-colors text-gray-900 placeholder-gray-500"
                        style={{ borderColor: '#A7C7E7' }}
                        placeholder={isLogin ? 'Enter your password' : 'Create password (min 6 characters)'}
                        required
                        minLength={6}
                    />
                </div>
                {!isLogin && (
                    <p className="text-xs text-gray-600 mt-1">Password must be at least 6 characters</p>
                )}
            </div>

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
                    {error === 'server_error' && (
                        <div>
                            <p className="font-medium">⚠️ Server Error</p>
                            <p className="mt-1">Something went wrong on our end. Please try again later.</p>
                        </div>
                    )}
                    {error === 'unknown' && (
                        <div>
                            <p className="font-medium">❓ Unknown Error</p>
                            <p className="mt-1">An unexpected error occurred. Please try again.</p>
                        </div>
                    )}
                    {error && !['Invalid login credentials', 'Email not confirmed', 'expired', 'confirmation_failed', 'server_error', 'unknown'].includes(error) && (
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
                    style={{ color: '#3a84ceff' }}
                >
                    {isLogin ? "Don't have an account? Sign up" : "Already have an account? Log in"}
                </button>
            </div>
        </form>
    );
}