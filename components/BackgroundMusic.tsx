'use client';

import { useState, useRef, useEffect } from 'react';
import { Volume2, VolumeX, Music } from 'lucide-react';

export default function BackgroundMusic() {
    const [isPlaying, setIsPlaying] = useState(false);
    const [isMuted, setIsMuted] = useState(true);
    const [showNotification, setShowNotification] = useState(true);
    const audioRef = useRef<HTMLAudioElement | null>(null);

    useEffect(() => {
        // Create audio element
        audioRef.current = new Audio('/music/birthday-song.mp3');
        audioRef.current.loop = true;
        audioRef.current.volume = 0.4; // Set to 40% volume

        // Auto-hide notification after 5 seconds
        const timer = setTimeout(() => {
            setShowNotification(false);
        }, 5000);

        // Cleanup on unmount
        return () => {
            clearTimeout(timer);
            if (audioRef.current) {
                audioRef.current.pause();
                audioRef.current = null;
            }
        };
    }, []);

    const toggleMusic = () => {
        if (!audioRef.current) return;

        if (!isPlaying) {
            // First click: start playing (muted to satisfy browser rules)
            audioRef.current.muted = true;
            audioRef.current.play()
                .then(() => {
                    setIsPlaying(true);
                    setIsMuted(true);

                    // Show notification that music is available
                    setShowNotification(true);
                    setTimeout(() => setShowNotification(false), 3000);
                })
                .catch(err => console.log('Playback failed:', err));
        } else {
            // Toggle mute
            audioRef.current.muted = !audioRef.current.muted;
            setIsMuted(!isMuted);
        }
    };

    return (
        <>
            {/* Music control button - with safe positioning for mobile */}
            <button
                onClick={toggleMusic}
                className="fixed bottom-4 sm:bottom-6 right-4 sm:right-6 z-[100] 
                           bg-white/90 backdrop-blur-sm p-3 sm:p-4 rounded-full 
                           shadow-xl hover:scale-110 transition-all duration-300 
                           border-2 border-pastel-pink group
                           touch-manipulation select-none"
                style={{
                    WebkitTapHighlightColor: 'transparent',
                    transform: 'translateZ(0)', // Force GPU acceleration
                }}
                aria-label="Toggle background music"
            >
                {isPlaying && !isMuted ? (
                    <>
                        <Volume2 size={20} className="sm:w-6 sm:h-6" style={{ color: '#FFD1DC' }} />
                        <span className="absolute -top-1 -right-1 w-2 h-2 sm:w-3 sm:h-3 bg-green-400 rounded-full animate-pulse"></span>
                    </>
                ) : (
                    <VolumeX size={20} className="sm:w-6 sm:h-6" style={{ color: '#A7C7E7' }} />
                )}
            </button>

            {/* Music hint notification - adjusted for mobile */}
            {showNotification && (
                <div className="fixed bottom-20 sm:bottom-24 right-4 sm:right-6 z-[100] 
                              bg-white/95 backdrop-blur-sm rounded-lg shadow-xl p-2 sm:p-3 
                              border-2 border-pastel-pink animate-bounce
                              max-w-[200px] sm:max-w-none"
                    style={{
                        transform: 'translateZ(0)',
                    }}
                >
                    <div className="flex items-center gap-1 sm:gap-2">
                        <Music size={14} className="sm:w-4 sm:h-4" style={{ color: '#FFD1DC' }} />
                        <p className="text-xs sm:text-sm text-gray-700">
                            {isPlaying && isMuted
                                ? "🔊 Tap to play!"
                                : "🎵 Background music"}
                        </p>
                    </div>
                    {/* Speech bubble arrow */}
                    <div className="absolute -bottom-2 right-6 w-3 h-3 sm:w-4 sm:h-4 bg-white border-b-2 border-r-2 border-pastel-pink transform rotate-45"></div>
                </div>
            )}
        </>
    );
}