'use client';

import { useEffect, useState, Suspense, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { LogOut, Heart, Film, MessageCircle, X } from 'lucide-react';
import Link from 'next/link';
import { createClient } from '../../lib/supabase/client';
import BirthdayFlashcards from '@/components/BirthdayFlashcards';
import { useMusic } from '@/context/MusicContext';
import MusicButton from '@/components/MusicButton';
import SwipeWishViewer from '@/components/SwipeWishViewer';

type Wish = {
    id: string;
    name: string;
    type: 'text' | 'image' | 'video';
    message: string | null;
    file_url: string | null;
    created_at: string;
};

// Create a separate component that uses useSearchParams
function DashboardContent() {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [loading, setLoading] = useState(true);
    const [wishes, setWishes] = useState<Wish[]>([]);
    const [activeTab, setActiveTab] = useState<'all' | 'text' | 'media'>('all');
    const [selectedImage, setSelectedImage] = useState<string | null>(null);
    const [selectedImageName, setSelectedImageName] = useState<string>('');
    const [showFlashcards, setShowFlashcards] = useState(false);
    const [showSpecialMessage, setShowSpecialMessage] = useState(true);
    const { setButtonPosition } = useMusic();
    const [showSwipeView, setShowSwipeView] = useState(false);

    const router = useRouter();
    const searchParams = useSearchParams();
    const supabase = createClient();

    useEffect(() => {
        const auth = sessionStorage.getItem('lyndaAuth');
        if (!auth) {
            router.push('/');
        } else {
            setIsAuthenticated(true);
            loadWishes();

            const showCards = searchParams.get('showFlashcards') === 'true';
            if (showCards) {
                setShowFlashcards(true);
                const url = new URL(window.location.href);
                url.searchParams.delete('showFlashcards');
                window.history.replaceState({}, '', url.toString());
            }
        }
    }, [router, searchParams]);

    useEffect(() => {
        if (showFlashcards) {
            setButtonPosition('inside-card');
        } else {
            setButtonPosition('bottom-right');
        }
    }, [showFlashcards, setButtonPosition]);

    const loadWishes = async () => {
        try {
            const { data, error } = await supabase
                .from('wishes')
                .select('*')
                .order('created_at', { ascending: false });

            if (error) {
                console.error('Supabase error:', error);
                alert('Error loading wishes. Please check your connection.');
                return;
            }
            setWishes(data || []);
        } catch (error) {
            console.error('Error loading wishes:', error);
            alert('Failed to load wishes. Check console for details.');
        } finally {
            setLoading(false);
        }
    };

    const handleLogout = async () => {
        const supabase = createClient();
        await supabase.auth.signOut();
        sessionStorage.removeItem('lyndaAuth');
        router.push('/');
    };

    // Define filteredWishes FIRST
    const filteredWishes = wishes.filter(wish => {
        if (activeTab === 'all') return true;
        if (activeTab === 'text') return wish.type === 'text';
        if (activeTab === 'media') return wish.type === 'image' || wish.type === 'video';
        return true;
    });

    const specialWish: Wish = {
        id: 'special-message',
        name: 'Atiqah',
        type: 'text',
        message: `Happy Birthday, Lynda! I made this for you as I want your 20th
to be a memorable one. I hope this can be something you can keep as a
memory for the rest of your life.
Here's a collection of birthday wishes from everyone who appreciates you.
We love you! 💕 - Atiqah`,
        file_url: '/images/photo.jpg',
        created_at: new Date().toISOString(),
    };

    // Define allWishesForSwipe HERE
    const allWishesForSwipe = [specialWish, ...filteredWishes];

    // ✅ MOVED THIS useEffect HERE - AFTER allWishesForSwipe is defined
    useEffect(() => {
        console.log('🔄 showSwipeView changed to:', showSwipeView);
        if (showSwipeView) {
            console.log('📦 Wishes for swipe:', allWishesForSwipe);
            console.log('🎯 First wish:', allWishesForSwipe[0]);
        }
    }, [showSwipeView, allWishesForSwipe]);

    // After defining allWishesForSwipe
    console.log('showSwipeView:', showSwipeView);
    console.log('allWishesForSwipe length:', allWishesForSwipe.length);
    console.log('First wish:', allWishesForSwipe[0]);

    if (!isAuthenticated || loading) {
        return (
            <div
                className="min-h-screen flex items-center justify-center"
                style={{
                    backgroundImage: "url('/images/background.jpg')",
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    backgroundRepeat: 'no-repeat',
                    backgroundColor: '#ce6e84ff',
                }}
            >
                <div className="absolute inset-0 bg-white/20 backdrop-blur-[1px]"></div>
                <div className="relative z-10 flex items-center justify-center min-h-screen w-full px-4">
                    <div className="text-center">
                        <div className="text-base sm:text-lg md:text-xl animate-pulse whitespace-nowrap" style={{ color: '#dca5b2ff' }}>
                            Loading Birthday Surprises...
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    const handleFlashcardComplete = () => {
        console.log('🎴 Flashcards completed');
        setShowFlashcards(false);
        setTimeout(() => {
            console.log('⏰ Opening swipe view');
            setShowSwipeView(true);
        }, 500);
    };

    return (
        <div
            className="min-h-screen"
            style={{
                backgroundImage: "url('/images/background.jpg')",
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                backgroundRepeat: 'no-repeat',
                backgroundAttachment: 'fixed',
                backgroundColor: '#ce6e84ff',
            }}
        >
            {showFlashcards && (
                <BirthdayFlashcards
                    onComplete={handleFlashcardComplete}
                />
            )}
            <MusicButton />

            <div className={`min-h-screen bg-white/40 backdrop-blur-[1px] transition-all duration-300 ${showFlashcards ? 'blur-sm pointer-events-none' : ''
                }`}>
                <header className="bg-white/90 backdrop-blur-sm shadow-sm sticky top-0 z-10">
                    <div className="max-w-6xl mx-auto px-4 py-4 flex justify-between items-center">
                        <h1 className="text-2xl md:text-3xl font-bold" style={{ color: '#d45673ff' }}>
                            💌 Birthday Wishes for Lynda 💌
                        </h1>
                        <div className="flex items-center gap-3">
                            <Link
                                href="/change-password"
                                className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-pastel-pink/10 transition-colors text-sm"
                                style={{ color: '#3a84ceff' }}
                            >
                                🔑 Change Password
                            </Link>
                            <button
                                onClick={handleLogout}
                                className="flex items-center gap-2 px-4 py-2 rounded-lg hover:bg-pastel-pink/10 transition-colors"
                                style={{ color: '#3a84ceff' }}
                            >
                                <LogOut size={20} />
                                Logout
                            </button>
                        </div>
                    </div>
                </header>

                <main className="max-w-6xl mx-auto px-4 py-8">
                    <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-xl p-6 mb-8 transform hover:scale-105 transition-transform border border-white/50">
                        <div className="flex items-center gap-6 flex-wrap md:flex-nowrap">
                            <div className="w-24 h-24 md:w-32 md:h-32 rounded-full overflow-hidden border-4 border-pastel-pink flex-shrink-0">
                                <img
                                    src="/images/photo.jpg"
                                    alt="Our photo"
                                    className="w-full h-full object-cover"
                                />
                            </div>

                            <div className="flex-1">
                                <h2 className="text-2xl font-bold mb-2" style={{ color: '#A7C7E7' }}>
                                    A Special Message for You
                                </h2>
                                <p className="text-gray-700 text-lg">
                                    Happy Birthday, Lynda! I made this for you as I want your 20th
                                    to be a memorable one. I hope this can be something you can keep as a
                                    memory for the rest of your life.
                                    Here's a collection of birthday wishes from everyone who appreciates you.
                                    We love you! 💕 - Atiqah
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-3 gap-4 mb-8">
                        <div className="bg-white/80 backdrop-blur-sm rounded-xl p-4 text-center shadow-lg">
                            <div className="text-3xl font-bold" style={{ color: '#d45673ff' }}>{wishes.length}</div>
                            <div className="text-sm text-gray-600">Total Wishes</div>
                        </div>
                        <div className="bg-white/80 backdrop-blur-sm rounded-xl p-4 text-center shadow-lg">
                            <div className="text-3xl font-bold" style={{ color: '#3a84ceff' }}>
                                {wishes.filter(w => w.type === 'text').length}
                            </div>
                            <div className="text-sm text-gray-600">Text Messages</div>
                        </div>
                        <div className="bg-white/80 backdrop-blur-sm rounded-xl p-4 text-center shadow-lg">
                            <div className="text-3xl font-bold" style={{ color: '#c5c56aff' }}>
                                {wishes.filter(w => w.type === 'image' || w.type === 'video').length}
                            </div>
                            <div className="text-sm text-gray-600">Photos & Videos</div>
                        </div>
                    </div>

                    <div className="flex justify-center mb-4">
                        <button
                            onClick={() => {
                                console.log('🔴 Button clicked! showSwipeView was:', showSwipeView);
                                setShowSwipeView(true);
                                console.log('✅ showSwipeView set to true');
                            }}
                            className="px-6 py-3 bg-[#dca5b2ff] text-white rounded-full shadow-lg hover:scale-105 transition-transform flex items-center gap-2 border-2 border-white/50"
                        >
                            View Wishes as Cards
                        </button>
                    </div>

                    <div className="flex gap-2 mb-6 border-b-2 border-pastel-blue/20 pb-2 bg-white/30 backdrop-blur-sm p-2 rounded-t-lg">
                        <button
                            onClick={() => setActiveTab('all')}
                            className={`px-4 py-2 rounded-lg transition-all ${activeTab === 'all'
                                ? 'bg-pastel-pink text-white shadow-md'
                                : 'hover:bg-white/50 text-gray-700'
                                }`}
                        >
                            All Wishes
                        </button>
                        <button
                            onClick={() => setActiveTab('text')}
                            className={`px-4 py-2 rounded-lg transition-all flex items-center gap-2 ${activeTab === 'text'
                                ? 'bg-pastel-pink text-white shadow-md'
                                : 'hover:bg-white/50 text-gray-700'
                                }`}
                        >
                            <MessageCircle size={18} />
                            Text
                        </button>
                        <button
                            onClick={() => setActiveTab('media')}
                            className={`px-4 py-2 rounded-lg transition-all flex items-center gap-2 ${activeTab === 'media'
                                ? 'bg-pastel-pink text-white shadow-md'
                                : 'hover:bg-white/50 text-gray-700'
                                }`}
                        >
                            <Film size={18} />
                            Photos & Videos
                        </button>
                    </div>

                    {filteredWishes.length === 0 ? (
                        <div className="text-center py-12 bg-white/80 backdrop-blur-sm rounded-2xl">
                            <p className="text-2xl text-gray-400">No wishes yet 🎀</p>
                            <p className="text-gray-500 mt-2">Check back soon!</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {filteredWishes.map((wish) => (
                                <div
                                    key={wish.id}
                                    className="bg-white/90 backdrop-blur-sm rounded-xl shadow-lg overflow-hidden transform hover:scale-105 transition-transform border border-white/50"
                                >
                                    <div className="p-4 bg-gradient-to-r from-pastel-pink/10 to-pastel-blue/10">
                                        <div className="flex items-center gap-2 mb-2">
                                            <Heart size={16} style={{ color: '#FFD1DC' }} />
                                            <span className="font-semibold text-gray-800">{wish.name}</span>
                                        </div>

                                        {wish.file_url && (
                                            <div className="mb-4 rounded-lg overflow-hidden bg-gray-100">
                                                {wish.type === 'image' ? (
                                                    <div
                                                        className="cursor-pointer group relative"
                                                        onClick={() => {
                                                            setSelectedImage(wish.file_url!);
                                                            setSelectedImageName(`Wish from ${wish.name}`);
                                                        }}
                                                    >
                                                        <img
                                                            src={wish.file_url}
                                                            alt={`Wish from ${wish.name}`}
                                                            className="w-full h-48 object-cover group-hover:opacity-90 transition-opacity"
                                                            onError={(e) => {
                                                                e.currentTarget.src = 'https://via.placeholder.com/300x200?text=Image+not+available';
                                                            }}
                                                        />
                                                        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/30">
                                                            <span className="bg-white text-pastel-pink px-3 py-1 rounded-full text-sm font-semibold">
                                                                Click to enlarge 🔍
                                                            </span>
                                                        </div>
                                                    </div>
                                                ) : wish.type === 'video' ? (
                                                    <video
                                                        src={wish.file_url}
                                                        controls
                                                        className="w-full h-48 object-cover"
                                                        onError={(e) => {
                                                            console.error('Video failed to load:', wish.file_url);
                                                        }}
                                                    />
                                                ) : null}
                                            </div>
                                        )}

                                        {wish.message && (
                                            <p className="text-gray-700 text-sm mb-3">{wish.message}</p>
                                        )}

                                        <p className="text-xs text-gray-400">
                                            {new Date(wish.created_at).toLocaleDateString('en-US', {
                                                month: 'long',
                                                day: 'numeric',
                                                year: 'numeric'
                                            })}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    {selectedImage && (
                        <div
                            className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4 animate-in fade-in duration-300"
                            onClick={() => setSelectedImage(null)}
                        >
                            <div className="relative max-w-6xl max-h-[90vh]">
                                <img
                                    src={selectedImage}
                                    alt={selectedImageName}
                                    className="max-w-full max-h-[90vh] object-contain rounded-lg shadow-2xl"
                                />
                                <button
                                    onClick={() => setSelectedImage(null)}
                                    className="absolute top-4 right-4 bg-white/20 hover:bg-white/40 backdrop-blur-sm rounded-full p-3 transition-all transform hover:scale-110"
                                    aria-label="Close"
                                >
                                    <X size={24} className="text-white" />
                                </button>
                                <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-black/50 backdrop-blur-sm text-white px-6 py-2 rounded-full text-sm">
                                    {selectedImageName}
                                </div>
                                <p className="absolute bottom-20 left-1/2 transform -translate-x-1/2 text-white/60 text-xs">
                                    Click anywhere outside image to close
                                </p>
                            </div>
                        </div>
                    )}
                </main>
            </div>

            {/* SWIPE VIEWER */}
            {showSwipeView && (
                <SwipeWishViewer
                    wishes={allWishesForSwipe}
                    onClose={() => setShowSwipeView(false)}
                    onSpecialMessageShown={() => setShowSpecialMessage(false)}
                />
            )}
        </div>
    );
}

// Main page component with Suspense
export default function DashboardPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen flex items-center justify-center">
                <div className="bg-white/90 backdrop-blur-sm p-8 rounded-2xl shadow-xl">
                    <div className="text-2xl animate-pulse text-center" style={{ color: '#dca5b2ff' }}>
                        Loading Dashboard...
                    </div>
                </div>
            </div>
        }>
            <DashboardContent />
        </Suspense>
    );
}