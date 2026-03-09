'use client';

import { motion, PanInfo } from 'framer-motion';
import { ChevronLeft, ChevronRight, X } from 'lucide-react';
import { useState, useEffect } from 'react';

interface Wish {
    id: string;
    name: string;
    type: 'text' | 'image' | 'video';
    message: string | null;
    file_url: string | null;
    created_at: string;
}

interface SwipeWishViewerProps {
    wishes: Wish[];
    onClose: () => void;
}

export default function SwipeWishViewer({ wishes, onClose }: SwipeWishViewerProps) {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [colorIndex, setColorIndex] = useState(0);

    // SOLID colors - no opacity
    const cardColors = [
        'from-[#FFD1DC] to-[#A7C7E7]',
        'from-[#FDFD97] to-[#FFD1DC]',
        'from-[#A7C7E7] to-[#FDFD97]',
        'from-[#FFB3BA] to-[#C7CEEA]',
        'from-[#B5EAD7] to-[#FFD1DC]',
        'from-[#C7CEEA] to-[#B5EAD7]',
    ];

    const currentWish = wishes[currentIndex];

    useEffect(() => {
        setColorIndex((prev) => (prev + 1) % cardColors.length);
    }, [currentIndex]);

    const handleSwipe = (event: any, info: PanInfo) => {
        if (info.offset.x < -50) {
            if (currentIndex < wishes.length - 1) {
                setCurrentIndex(currentIndex + 1);
            }
        } else if (info.offset.x > 50) {
            if (currentIndex > 0) {
                setCurrentIndex(currentIndex - 1);
            }
        }
    };

    const goToNext = () => {
        if (currentIndex < wishes.length - 1) {
            setCurrentIndex(currentIndex + 1);
        }
    };

    const goToPrevious = () => {
        if (currentIndex > 0) {
            setCurrentIndex(currentIndex - 1);
        }
    };

    if (!wishes || wishes.length === 0) {
        return (
            <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
                <div className="bg-white rounded-2xl p-8 text-center">
                    <p className="text-gray-700">No wishes to display</p>
                    <button
                        onClick={onClose}
                        className="mt-4 px-4 py-2 bg-pastel-pink text-white rounded-lg"
                    >
                        Close
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="fixed inset-0 z-50 bg-black/30 backdrop-blur-sm flex items-center justify-center p-4">
            <button
                onClick={onClose}
                className="absolute top-4 right-4 z-50 bg-white/80 text-gray-700 rounded-full p-2 hover:bg-white transition-colors shadow-lg"
            >
                <X size={20} />
            </button>

            <div className="absolute top-4 left-1/2 transform -translate-x-1/2 bg-white/80 text-gray-700 px-4 py-1 rounded-full text-sm shadow-lg">
                {currentIndex + 1} / {wishes.length}
            </div>

            <motion.div
                drag="x"
                dragConstraints={{ left: 0, right: 0 }}
                dragElastic={0.5}
                onDragEnd={handleSwipe}
                className="w-full max-w-md cursor-grab active:cursor-grabbing"
            >
                {/* SOLID gradient background */}
                <div className={`bg-gradient-to-br ${cardColors[colorIndex]} rounded-2xl shadow-2xl overflow-hidden border-2 border-white/50`}>
                    {/* Semi-transparent overlay for text readability */}
                    <div className="p-6 bg-black/20 backdrop-blur-[2px]">
                        <h3 className="text-xl font-bold text-white mb-2 drop-shadow-lg">
                            {currentWish.name}
                        </h3>

                        {currentWish.file_url && (
                            <div className="mb-4 rounded-lg overflow-hidden">
                                {currentWish.type === 'image' && (
                                    <img
                                        src={currentWish.file_url}
                                        alt="Wish"
                                        className="w-full h-64 object-cover rounded-lg"
                                    />
                                )}
                                {currentWish.type === 'video' && (
                                    <video
                                        src={currentWish.file_url}
                                        controls
                                        className="w-full h-64 object-cover rounded-lg"
                                    />
                                )}
                            </div>
                        )}

                        {currentWish.message && (
                            <p className="text-white text-lg mb-4 drop-shadow-md">
                                {currentWish.message}
                            </p>
                        )}

                        <p className="text-sm text-white/90 drop-shadow">
                            {new Date(currentWish.created_at).toLocaleDateString('en-US', {
                                month: 'long',
                                day: 'numeric',
                                year: 'numeric'
                            })}
                        </p>
                    </div>

                    <div className="bg-black/40 backdrop-blur-sm p-3 text-center text-sm text-white border-t border-white/30">
                        ← Swipe left • Swipe right →
                    </div>
                </div>
            </motion.div>

            <div className="absolute bottom-8 left-0 right-0 flex justify-center gap-4">
                <button
                    onClick={goToPrevious}
                    className="p-3 bg-white/80 backdrop-blur-sm rounded-full text-gray-700 hover:bg-white transition-colors disabled:opacity-30 shadow-lg"
                    disabled={currentIndex === 0}
                >
                    <ChevronLeft size={24} />
                </button>
                <button
                    onClick={goToNext}
                    className="p-3 bg-white/80 backdrop-blur-sm rounded-full text-gray-700 hover:bg-white transition-colors disabled:opacity-30 shadow-lg"
                    disabled={currentIndex === wishes.length - 1}
                >
                    <ChevronRight size={24} />
                </button>
            </div>
        </div>
    );
}