'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart } from 'lucide-react';

interface BirthdayLetterProps {
    onOpen: () => void;
}

export default function BirthdayLetter({ onOpen }: BirthdayLetterProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [isSealed, setIsSealed] = useState(true);

    const handleOpen = () => {
        setIsOpen(true);
        setIsSealed(false);
        // Wait for animation to complete before proceeding
        setTimeout(() => {
            onOpen();
        }, 2000);
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm">
            <motion.div
                className="relative w-80 h-96 cursor-pointer"
                whileHover={{ scale: 1.02 }}
                onClick={handleOpen}
            >
                {/* Sealed Letter - Front */}
                <AnimatePresence>
                    {isSealed && (
                        <motion.div
                            className="absolute inset-0 bg-gradient-to-br from-pastel-pink to-pastel-blue rounded-lg shadow-2xl overflow-hidden"
                            initial={{ rotateY: 0 }}
                            animate={{ rotateY: isOpen ? 180 : 0 }}
                            transition={{ duration: 1, ease: "easeInOut" }}
                            style={{
                                backfaceVisibility: 'hidden',
                                transformStyle: 'preserve-3d',
                            }}
                        >
                            {/* Wax Seal */}
                            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                                <div className="w-20 h-20 bg-[#B76E79] rounded-full flex items-center justify-center shadow-xl">
                                    <Heart className="w-10 h-10 text-white" fill="white" />
                                </div>
                            </div>

                            {/* Envelope Flap */}
                            <div className="absolute top-0 left-0 w-full h-20 bg-gradient-to-b from-pastel-pink/30 to-transparent">
                                <div className="w-full h-full" style={{
                                    clipPath: 'polygon(0 0, 100% 0, 50% 100%)',
                                    background: 'linear-gradient(to bottom, #FFD1DC, #A7C7E7)'
                                }} />
                            </div>

                            {/* "Open Me" Text */}
                            <motion.p
                                className="absolute bottom-8 left-0 right-0 text-center text-white font-dancing text-xl"
                                animate={{ y: [0, -5, 0] }}
                                transition={{ duration: 2, repeat: Infinity }}
                            >
                                ✨ Open with love ✨
                            </motion.p>

                            {/* Decorative corners */}
                            <div className="absolute top-4 left-4 w-8 h-8 border-t-2 border-l-2 border-white/50" />
                            <div className="absolute top-4 right-4 w-8 h-8 border-t-2 border-r-2 border-white/50" />
                            <div className="absolute bottom-4 left-4 w-8 h-8 border-b-2 border-l-2 border-white/50" />
                            <div className="absolute bottom-4 right-4 w-8 h-8 border-b-2 border-r-2 border-white/50" />
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Letter Content - Back (shown when opened) */}
                <AnimatePresence>
                    {isOpen && (
                        <motion.div
                            className="absolute inset-0 bg-white rounded-lg shadow-2xl p-8 overflow-y-auto"
                            initial={{ rotateY: -180 }}
                            animate={{ rotateY: 0 }}
                            transition={{ duration: 1, ease: "easeInOut" }}
                            style={{
                                backfaceVisibility: 'hidden',
                                transformStyle: 'preserve-3d',
                            }}
                        >
                            {/* Letter Paper Texture */}
                            <div className="relative h-full flex flex-col">
                                {/* Handwritten-style header */}
                                <div className="text-center mb-6">
                                    <h2 className="font-dancing text-4xl text-pastel-pink mb-2">
                                        Dear Lynda,
                                    </h2>
                                    <div className="w-20 h-0.5 bg-pastel-pink/30 mx-auto" />
                                </div>

                                {/* Letter Content */}
                                <div className="flex-1 space-y-4 font-dancing text-gray-700">
                                    <p className="text-lg leading-relaxed">
                                        Happy 20th Birthday! 🎂
                                    </p>
                                    <p className="text-base leading-relaxed">
                                        I wanted to create something special just for you -
                                        a place where all the love and wishes from your friends
                                        and family could live forever.
                                    </p>
                                    <p className="text-base leading-relaxed">
                                        Behind this letter lies a collection of messages,
                                        photos, and videos from everyone who loves you.
                                        Take your time, enjoy each one, and know that
                                        you are so incredibly loved.
                                    </p>
                                    <p className="text-base leading-relaxed mt-4">
                                        With all my heart,
                                    </p>
                                    <p className="text-xl font-bold text-pastel-pink">
                                        Atiqah 💕
                                    </p>
                                </div>

                                {/* Decorative elements */}
                                <div className="absolute bottom-4 right-4 text-pastel-pink/30 text-6xl">
                                    ✉️
                                </div>

                                {/* Continue hint */}
                                <motion.p
                                    className="text-center text-sm text-gray-400 mt-4"
                                    animate={{ opacity: [0.5, 1, 0.5] }}
                                    transition={{ duration: 2, repeat: Infinity }}
                                >
                                    Tap to continue to your birthday surprise...
                                </motion.p>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </motion.div>
        </div>
    );
}