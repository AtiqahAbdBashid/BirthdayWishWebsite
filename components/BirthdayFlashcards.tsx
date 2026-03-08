'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import confetti from 'canvas-confetti';

interface BirthdayFlashcardsProps {
    onComplete: () => void;
}

export default function BirthdayFlashcards({ onComplete }: BirthdayFlashcardsProps) {
    const [currentCard, setCurrentCard] = useState(0);
    const [direction, setDirection] = useState(0);

    const cards = [
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
        setDirection(newDirection);
        if (newDirection > 0 && currentCard < cards.length - 1) {
            setCurrentCard(currentCard + 1);
        } else if (newDirection < 0 && currentCard > 0) {
            setCurrentCard(currentCard - 1);
        }
    };

    const handleLastCard = () => {
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
        if (index === currentCard) {
            return {
                zIndex: 30,
                scale: 1,
                rotate: 0,
                y: 0,
                x: 0,
                opacity: 1,
                filter: 'brightness(1)'
            };
        } else if (index === currentCard - 1 || (currentCard === 0 && index === cards.length - 1)) {
            return {
                zIndex: 20,
                scale: 0.92,
                rotate: -4,
                y: 12,
                x: -8,
                opacity: 0.7,
                filter: 'brightness(0.7)'
            };
        } else if (index === currentCard - 2 || (currentCard === 1 && index === cards.length - 1) || (currentCard === 0 && index === cards.length - 2)) {
            return {
                zIndex: 10,
                scale: 0.84,
                rotate: 5,
                y: 24,
                x: 10,
                opacity: 0.4,
                filter: 'brightness(0.5)'
            };
        } else {
            return {
                zIndex: 0,
                scale: 0.76,
                rotate: -3,
                y: 36,
                x: -12,
                opacity: 0,
                filter: 'brightness(0.3)'
            };
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm">
            <div className="relative w-full max-w-md h-[600px] flex items-center justify-center pb-16">
                {cards.map((card, index) => {
                    const style = getCardStyle(index);

                    return (
                        <motion.div
                            key={card.id}
                            className="absolute w-full"
                            style={{
                                zIndex: style.zIndex,
                                scale: style.scale,
                                rotate: `${style.rotate}deg`,
                                y: style.y,
                                x: style.x,
                                opacity: style.opacity,
                                filter: style.filter,
                                pointerEvents: index === currentCard ? 'auto' : 'none',
                                transition: 'all 0.3s ease',
                                transformOrigin: 'center center',
                                borderRadius: '1rem',
                                overflow: 'hidden',
                                boxShadow: index === currentCard
                                    ? '0 25px 50px -12px rgba(0, 0, 0, 0.5)'
                                    : '0 15px 30px -10px rgba(0, 0, 0, 0.3)'
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
                                stiffness: 300,
                                damping: 30
                            }}
                            drag={index === currentCard ? "x" : false}
                            dragConstraints={{ left: 0, right: 0 }}
                            dragElastic={1}
                            onDragEnd={(e, { offset, velocity }) => {
                                if (index !== currentCard) return;
                                const swipe = swipePower(offset.x, velocity.x);

                                if (swipe < -swipeConfidenceThreshold && currentCard < cards.length - 1) {
                                    paginate(1);
                                } else if (swipe > swipeConfidenceThreshold && currentCard > 0) {
                                    paginate(-1);
                                }
                            }}
                        >
                            <img
                                src={card.gif}
                                alt={`Birthday card ${card.id}`}
                                className="w-full h-auto rounded-xl"
                                style={{
                                    display: 'block',
                                    width: '100%',
                                    height: 'auto',
                                    boxShadow: 'none',
                                    background: 'transparent'
                                }}
                            />
                        </motion.div>
                    );
                })}

                {/* Navigation Buttons - Now outside all cards */}
                <div className="absolute bottom-0 left-0 right-0 flex justify-center translate-y-full">
                    {currentCard < cards.length - 1 ? (
                        <button
                            onClick={() => paginate(1)}
                            className="px-6 py-2 text-white rounded-full font-semibold shadow-lg hover:scale-105 transition-transform"
                            style={{ backgroundColor: '#f289cbff' }}
                        >
                            Next →
                        </button>
                    ) : (
                        <button
                            onClick={handleLastCard}
                            className="px-6 py-2 text-white rounded-full font-semibold shadow-lg hover:scale-105 transition-transform"
                            style={{ backgroundColor: '#f289cbff' }}
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


            </div>
        </div>
    );
}