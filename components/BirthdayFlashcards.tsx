'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import confetti from 'canvas-confetti';
import { useSound } from '@/hooks/useSound';
import { Volume2, VolumeX } from 'lucide-react';
import { useMusic } from '@/context/MusicContext';

interface BirthdayFlashcardsProps {
    onComplete: () => void;
}

export default function BirthdayFlashcards({ onComplete }: BirthdayFlashcardsProps) {
    const [currentCard, setCurrentCard] = useState(0);
    const [direction, setDirection] = useState(0);
    const { isPlaying, isMuted, toggleMute } = useMusic();
    const [isMobile, setIsMobile] = useState(false);
    const [videosLoaded, setVideosLoaded] = useState(false);
    const [loadedCount, setLoadedCount] = useState(0);
    const [isReady, setIsReady] = useState(false);

    // Add ready state timeout
    useEffect(() => {
        const timer = setTimeout(() => setIsReady(true), 500);
        return () => clearTimeout(timer);
    }, []);

    // Check mobile on mount and resize
    useEffect(() => {
        const checkMobile = () => {
            setIsMobile(window.innerWidth < 768);
        };
        checkMobile();
        window.addEventListener('resize', checkMobile);
        return () => window.removeEventListener('resize', checkMobile);
    }, []);

    // Initialize sounds
    const playSwipe = useSound('/sounds/swipe.mp3', 0.1);
    const playPop = useSound('/sounds/pop.mp3', 0.2);

    const cards = [
        {
            id: 0,
            gif: '/images/flashcards/card-0.gif',
        },
        {
            id: 1,
            gif: '/images/flashcards/card-1.gif',
        },
        {
            id: 2,
            gif: '/images/flashcards/card-2.gif',
        },
        {
            id: 3,
            gif: '/images/flashcards/card-3.gif',
        },
        {
            id: 4,
            gif: '/images/flashcards/card-4.gif',
        }
    ];

    const swipeConfidenceThreshold = 10000;
    const swipePower = (offset: number, velocity: number) => {
        return Math.abs(offset) * velocity;
    };

    const paginate = (newDirection: number) => {
        playSwipe();
        setDirection(newDirection);
        if (newDirection > 0 && currentCard < cards.length - 1) {
            setCurrentCard(currentCard + 1);
        } else if (newDirection < 0 && currentCard > 0) {
            setCurrentCard(currentCard - 1);
        }
    };

    const handleVideoLoaded = () => {
        setLoadedCount(prev => {
            const newCount = prev + 1;
            if (newCount === cards.length) {
                setVideosLoaded(true);
            }
            return newCount;
        });
    };

    const handleLastCard = () => {
        playPop();
        confetti({
            particleCount: 150,
            spread: 80,
            origin: { y: 0.6 }
        });
        setTimeout(() => {
            onComplete();
        }, 1500);
    };

    const getCardStyle = (index: number) => {
        // SIMPLIFIED MOBILE VERSION - only current card is visible
        if (isMobile) {
            if (index === currentCard) {
                return {
                    zIndex: 30,
                    scale: 1,
                    rotate: 0,
                    y: 0,
                    x: 0,
                    opacity: 1,
                    filter: 'brightness(1)',
                };
            } else {
                // Completely hidden - no layers to cause flicker
                return {
                    zIndex: 0,
                    scale: 0,
                    rotate: 0,
                    y: 0,
                    x: 0,
                    opacity: 0,
                    filter: 'brightness(1)',
                };
            }
        }

        // DESKTOP VERSION - keep your existing stacked effect
        if (index === currentCard) {
            return {
                zIndex: 30,
                scale: 1,
                rotate: 0,
                y: 0,
                x: 0,
                opacity: 1,
                filter: 'brightness(1)',
            };
        } else if (index === currentCard - 1 || (currentCard === 0 && index === cards.length - 1)) {
            return {
                zIndex: 20,
                scale: 0.92,
                rotate: -4,
                y: 12,
                x: -8,
                opacity: 0.7,
                filter: 'brightness(0.7)',
            };
        } else if (index === currentCard - 2 || (currentCard === 1 && index === cards.length - 1) || (currentCard === 0 && index === cards.length - 2)) {
            return {
                zIndex: 10,
                scale: 0.84,
                rotate: 5,
                y: 24,
                x: 10,
                opacity: 0.4,
                filter: 'brightness(0.5)',
            };
        } else {
            return {
                zIndex: 0,
                scale: 0.76,
                rotate: -3,
                y: 36,
                x: -12,
                opacity: 0,
                filter: 'brightness(0.3)',
            };
        }
    };

    return (
        <>
            {/* Loading Indicator - Shows while component initializes */}
            {!isReady && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 backdrop-blur-sm">
                    <div className="bg-white/90 backdrop-blur-sm p-8 rounded-2xl shadow-xl text-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pastel-pink mx-auto mb-4"></div>
                        <p className="text-gray-700 text-lg">Getting your surprise ready...</p>
                        <p className="text-xs text-gray-400 mt-2">Just a moment</p>
                    </div>
                </div>
            )}

            {/* Main flashcard container - only show when ready */}
            {isReady && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm flashcard-container"
                    style={{
                        willChange: 'transform',
                        transform: 'translateZ(0)'
                    }}
                >
                    <div className="relative w-full max-w-md h-[600px] flex items-center justify-center pb-16">
                        {cards.map((card, index) => {
                            const style = getCardStyle(index);
                            const isCurrentCard = index === currentCard;

                            return (
                                <motion.div
                                    key={card.id}
                                    className="absolute w-full flashcard-card"
                                    style={{
                                        zIndex: style.zIndex,
                                        scale: style.scale,
                                        rotate: `${style.rotate}deg`,
                                        y: style.y,
                                        x: style.x,
                                        opacity: style.opacity,
                                        filter: style.filter,
                                        pointerEvents: isCurrentCard ? 'auto' : 'none',
                                        transition: 'all 0.3s ease',
                                        transformOrigin: 'center center',
                                        borderRadius: '1rem',
                                        overflow: 'hidden',
                                        boxShadow: index === currentCard
                                            ? '0 25px 50px -12px rgba(0, 0, 0, 0.5)'
                                            : '0 15px 30px -10px rgba(0, 0, 0, 0.3)',
                                    }}
                                    animate={{
                                        scale: style.scale,
                                        rotate: `${style.rotate}deg`,
                                        y: style.y,
                                        x: style.x,
                                        opacity: style.opacity,
                                        filter: style.filter
                                    }}
                                    transition={{
                                        type: "spring",
                                        stiffness: isMobile ? 200 : 300,
                                        damping: isMobile ? 40 : 30,
                                        mass: isMobile ? 0.3 : 0.5,
                                    }}
                                    drag={isCurrentCard ? "x" : false}
                                    dragConstraints={{ left: 0, right: 0 }}
                                    dragElastic={0.2}
                                    onDragEnd={(e, { offset, velocity }) => {
                                        if (!isCurrentCard) return;
                                        const swipe = swipePower(offset.x, velocity.x);

                                        if (swipe < -swipeConfidenceThreshold && currentCard < cards.length - 1) {
                                            paginate(1);
                                        } else if (swipe > swipeConfidenceThreshold && currentCard > 0) {
                                            paginate(-1);
                                        }
                                    }}
                                >
                                    <div className="relative w-full h-full">
                                        {/* Video version - hardware accelerated */}
                                        <video
                                            key={`video-${card.id}`}
                                            autoPlay
                                            loop
                                            muted
                                            playsInline
                                            preload="auto"
                                            onLoadedData={handleVideoLoaded}
                                            className="w-full h-auto rounded-xl"
                                            style={{
                                                display: 'block',
                                                width: '100%',
                                                height: 'auto',
                                            }}
                                        >
                                            <source src={`/videos/flashcards/card-${card.id}.mp4`} type="video/mp4" />
                                            {/* Fallback to GIF if video fails */}
                                            <img
                                                src={card.gif}
                                                alt={`Birthday card ${card.id}`}
                                                className="w-full h-auto rounded-xl"
                                            />
                                        </video>

                                        {/* Music Button on First Card */}
                                        {currentCard === 0 && (
                                            <motion.button
                                                onClick={toggleMute}
                                                className="absolute z-[100] bottom-4 right-4 bg-white/90 backdrop-blur-sm p-3 rounded-full shadow-xl hover:scale-110 transition-all duration-300 border-2 border-pastel-pink"
                                                animate={{
                                                    scale: [1, 1.1, 1],
                                                }}
                                                transition={{
                                                    duration: 1.5,
                                                    repeat: Infinity,
                                                    repeatType: "reverse"
                                                }}
                                                whileHover={{ scale: 1.2 }}
                                            >
                                                {!isMuted ? (
                                                    <Volume2 size={24} style={{ color: '#FFD1DC' }} />
                                                ) : (
                                                    <VolumeX size={24} style={{ color: '#A7C7E7' }} />
                                                )}
                                            </motion.button>
                                        )}
                                    </div>
                                </motion.div>
                            );
                        })}

                        {/* Navigation Buttons */}
                        <div className="absolute bottom-0 left-0 right-0 flex justify-center translate-y-full">
                            {currentCard < cards.length - 1 ? (
                                <button
                                    onClick={() => paginate(1)}
                                    className="px-6 py-2 text-white rounded-full font-semibold shadow-lg hover:scale-105 transition-transform"
                                    style={{ backgroundColor: '#dca5b2ff' }}
                                >
                                    Next →
                                </button>
                            ) : (
                                <button
                                    onClick={handleLastCard}
                                    className="px-6 py-2 text-white rounded-full font-semibold shadow-lg hover:scale-105 transition-transform"
                                    style={{ backgroundColor: '#dca5b2ff' }}
                                >
                                    ✨ Open Your Wishes ✨
                                </button>
                            )}
                        </div>

                        {/* Progress dots */}
                        <div className="absolute -bottom-12 left-0 right-0 flex justify-center gap-2">
                            {cards.map((_, index) => (
                                <button
                                    key={index}
                                    onClick={() => {
                                        playSwipe();
                                        setDirection(index > currentCard ? 1 : -1);
                                        setCurrentCard(index);
                                    }}
                                    className={`w-2 h-2 rounded-full transition-all ${index === currentCard
                                        ? 'w-6 bg-pastel-pink'
                                        : 'bg-white/50 hover:bg-white/80'
                                        }`}
                                />
                            ))}
                        </div>

                        {/* Swipe hint */}
                        <div className="absolute -bottom-24 left-0 right-0 text-center text-white/70 text-sm">
                            ← Swipe to continue →
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}