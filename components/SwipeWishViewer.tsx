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

    const cardColors = [
        'from-pastel-pink/30 to-pastel-blue/30',
        'from-pastel-yellow/30 to-pastel-pink/30',
        'from-pastel-blue/30 to-pastel-yellow/30',
        'from-[#FFD1DC]/30 to-[#FDFD97]/30',
        'from-[#A7C7E7]/30 to-[#FFB3BA]/30',
        'from-[#C7CEEA]/30 to-[#B5EAD7]/30',
    ];

    const currentWish = wishes[currentIndex];

    // Log when component mounts
    useEffect(() => {
        console.log('SwipeViewer mounted');
        console.log('Initial colorIndex:', colorIndex);
        console.log('Card colors array:', cardColors);
    }, []);

    // Log when colorIndex changes
    useEffect(() => {
        console.log('colorIndex changed to:', colorIndex);
        console.log('Current gradient:', cardColors[colorIndex]);
    }, [colorIndex]);

    // Log when currentIndex changes
    useEffect(() => {
        console.log('Swiped to wish index:', currentIndex);
        console.log('Setting new colorIndex from', colorIndex, 'to', (colorIndex + 1) % cardColors.length);
        setColorIndex((prev) => {
            const newIndex = (prev + 1) % cardColors.length;
            console.log('New colorIndex set to:', newIndex);
            return newIndex;
        });
    }, [currentIndex]);

    const handleSwipe = (event: any, info: PanInfo) => {
        console.log('Swipe detected! Offset:', info.offset.x);
        if (info.offset.x < -50) {
            console.log('Swiped left - going to next wish');
            if (currentIndex < wishes.length - 1) {
                setCurrentIndex(currentIndex + 1);
            }
        } else if (info.offset.x > 50) {
            console.log('Swiped right - going to previous wish');
            if (currentIndex > 0) {
                setCurrentIndex(currentIndex - 1);
            }
        }
    };

    const goToNext = () => {
        console.log('Next button clicked');
        if (currentIndex < wishes.length - 1) {
            setCurrentIndex(currentIndex + 1);
        }
    };

    const goToPrevious = () => {
        console.log('Previous button clicked');
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
                {/* Use a simple background color first to test */}
                <div className={`bg-gradient-to-br ${cardColors[colorIndex]} rounded-2xl shadow-2xl overflow-hidden border-2 border-white/50`}>
                    <div className="p-6"> {/* ← REMOVED bg-white/80 backdrop-blur-sm */}
                        <h3 className="text-xl font-bold text-white mb-2 drop-shadow-lg"> {/* Change text color to white */}
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

                        <p className="text-sm text-white/80 drop-shadow">
                            {new Date(currentWish.created_at).toLocaleDateString('en-US', {
                                month: 'long',
                                day: 'numeric',
                                year: 'numeric'
                            })}
                        </p>
                    </div>

                    <div className="bg-black/20 backdrop-blur-sm p-3 text-center text-sm text-white border-t border-white/30">
                        ← Previous • Next →
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