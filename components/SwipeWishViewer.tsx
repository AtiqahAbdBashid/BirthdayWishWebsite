'use client';

import { useState } from 'react';
import { motion, PanInfo } from 'framer-motion';
import { ChevronLeft, ChevronRight, X } from 'lucide-react';

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

    const currentWish = wishes[currentIndex];

    const handleSwipe = (event: any, info: PanInfo) => {
        if (info.offset.x < -50) {
            // Swiped left -> Next wish
            if (currentIndex < wishes.length - 1) {
                setCurrentIndex(currentIndex + 1);
            }
        } else if (info.offset.x > 50) {
            // Swiped right -> Previous wish
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

    return (
        <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-sm flex items-center justify-center p-4">
            {/* Close button */}
            <button
                onClick={onClose}
                className="absolute top-4 right-4 z-50 text-white/70 hover:text-white"
            >
                <X size={24} />
            </button>

            {/* Progress indicator */}
            <div className="absolute top-4 left-1/2 transform -translate-x-1/2 text-white/70">
                {currentIndex + 1} / {wishes.length}
            </div>

            {/* Swipeable card */}
            <motion.div
                drag="x"
                dragConstraints={{ left: 0, right: 0 }}
                dragElastic={0.5}
                onDragEnd={handleSwipe}
                className="w-full max-w-md cursor-grab active:cursor-grabbing"
            >
                <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">
                    <div className="p-6">
                        <h3 className="text-xl font-bold text-pastel-pink mb-2">
                            {currentWish.name}
                        </h3>

                        {currentWish.file_url && (
                            <div className="mb-4 rounded-lg overflow-hidden">
                                {currentWish.type === 'image' && (
                                    <img
                                        src={currentWish.file_url}
                                        alt="Wish"
                                        className="w-full h-64 object-cover"
                                    />
                                )}
                                {currentWish.type === 'video' && (
                                    <video
                                        src={currentWish.file_url}
                                        controls
                                        className="w-full h-64 object-cover"
                                    />
                                )}
                            </div>
                        )}

                        {currentWish.message && (
                            <p className="text-gray-700 text-lg mb-4">
                                {currentWish.message}
                            </p>
                        )}

                        <p className="text-sm text-gray-400">
                            {new Date(currentWish.created_at).toLocaleDateString('en-US', {
                                month: 'long',
                                day: 'numeric',
                                year: 'numeric'
                            })}
                        </p>
                    </div>

                    <div className="bg-pastel-pink/10 p-3 text-center text-sm text-gray-500">
                        ← Swipe left • Swipe right →
                    </div>
                </div>
            </motion.div>

            {/* Navigation buttons */}
            <div className="absolute bottom-8 left-0 right-0 flex justify-center gap-4">
                <button
                    onClick={goToPrevious}
                    className="p-3 bg-white/20 backdrop-blur-sm rounded-full text-white hover:bg-white/30 transition-colors disabled:opacity-30"
                    disabled={currentIndex === 0}
                >
                    <ChevronLeft size={24} />
                </button>
                <button
                    onClick={goToNext}
                    className="p-3 bg-white/20 backdrop-blur-sm rounded-full text-white hover:bg-white/30 transition-colors disabled:opacity-30"
                    disabled={currentIndex === wishes.length - 1}
                >
                    <ChevronRight size={24} />
                </button>
            </div>
        </div>
    );
}