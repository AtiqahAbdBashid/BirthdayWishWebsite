'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Heart } from 'lucide-react';

interface BirthdayLetterProps {
    isOpen: boolean;
    onClose: () => void;
}

export default function BirthdayLetter({ isOpen, onClose }: BirthdayLetterProps) {
    const [isFullyOpen, setIsFullyOpen] = useState(false);

    useEffect(() => {
        if (isOpen) {
            const timer = setTimeout(() => setIsFullyOpen(true), 800);
            return () => clearTimeout(timer);
        } else {
            setIsFullyOpen(false);
        }
    }, [isOpen]);

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    className="fixed inset-0 z-[100] flex items-center justify-center p-4"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.3 }}
                >
                    {/* Backdrop with blur */}
                    <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />

                    {/* Letter Container */}
                    <motion.div
                        className="relative w-full max-w-3xl max-h-[90vh] bg-[#fdfaf6] rounded-lg shadow-2xl overflow-hidden border border-[#e8d9c5]"
                        initial={{ scale: 0.3, y: 100, rotateX: -90 }}
                        animate={{ scale: 1, y: 0, rotateX: 0 }}
                        exit={{ scale: 0.3, y: 100, rotateX: -90 }}
                        transition={{
                            type: "spring",
                            damping: 15,
                            stiffness: 100,
                            duration: 0.8
                        }}
                        style={{ transformOrigin: "top center" }}
                    >
                        {/* Close button */}
                        <button
                            onClick={onClose}
                            className="absolute top-4 right-4 z-10 text-gray-500 hover:text-gray-700 transition-colors bg-white/80 rounded-full p-1"
                        >
                            <X size={20} />
                        </button>

                        {/* Letter Content - Scrollable */}
                        <div className="h-full max-h-[90vh] overflow-y-auto p-8 md:p-12">
                            {/* Decorative corner elements - replaces the white round thing */}
                            <div className="absolute top-6 left-6 w-12 h-12 border-t-2 border-l-2 border-pastel-pink/30 rounded-tl-lg" />
                            <div className="absolute top-6 right-6 w-12 h-12 border-t-2 border-r-2 border-pastel-pink/30 rounded-tr-lg" />
                            <div className="absolute bottom-6 left-6 w-12 h-12 border-b-2 border-l-2 border-pastel-pink/30 rounded-bl-lg" />
                            <div className="absolute bottom-6 right-6 w-12 h-12 border-b-2 border-r-2 border-pastel-pink/30 rounded-br-lg" />

                            {/* Envelope Flap Animation - removed the white round thing */}
                            <motion.div
                                className="relative mb-8"
                                initial={{ y: -50, opacity: 0 }}
                                animate={{ y: 0, opacity: 1 }}
                                transition={{ delay: 0.5, duration: 0.5 }}
                            >
                                <div className="w-20 h-20 mx-auto mb-4">
                                    <svg viewBox="0 0 100 100" className="w-full h-full">
                                        <polygon points="50,10 90,40 50,70 10,40" fill="#FFD1DC" opacity="0.3" />
                                        <polygon points="50,10 90,40 50,70 10,40" stroke="#A7C7E7" strokeWidth="2" fill="none" />
                                        <circle cx="50" cy="40" r="8" fill="#FFD1DC" className="animate-pulse" />
                                    </svg>
                                </div>
                            </motion.div>

                            {/* Letter Content - Fades in after opening */}
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.8, duration: 0.5 }}
                                className="space-y-6"
                            >
                                <h1 className="font-['Great_Vibes'] text-5xl md:text-6xl text-center text-pastel-pink mb-8">
                                    Dear Lynda,
                                </h1>

                                <div className="space-y-4 text-gray-700 font-['Cormorant_Garamond'] text-lg md:text-xl leading-relaxed text-justify">
                                    <p className="first-letter:text-4xl first-letter:text-pastel-pink first-letter:mr-1 first-letter:float-left">
                                        As I am writing this, I am actually crying. What was initially just another project in my portfolio,
                                        now it became a core memory. At least now I know these tears will clear my acne.
                                    </p>

                                    <p>
                                        As I was developing this website as a surprise for you, I came to realize how lucky I am
                                        to get to know you as a person and to be friends with you. How supportive your environment is,
                                        how incredible of a person you are, that the moment I let them know of this secret project
                                        I am working on, they all jump in to contribute.
                                    </p>

                                    <p>
                                        I had the chance to contact a family member of yours, to ask the participation of those people
                                        you know from back home. And as I expected, they did not say no. And as the wishes come flooding in,
                                        I cant stop myself from being moved by the love surrounding you. It made me feel incredibly lucky to have you in my orbit.
                                        Because if these are the people that appreciates you, you must have been an amazing person, Mashallah.
                                        One that is blessed with an amazing circle of family and friends Alhamdulillah
                                    </p>

                                    <p>
                                        If by this project didn't tell you enough how much I appreciate you, then maybe this letter will.
                                        I love you, and certainly miss you very much. I hope everything will be better soon, and that
                                        I can see you again Inshallah. I am so excited for your future; to see you be successful and still
                                        be the humble person I know of you. I pray for you, may Allah bless you with all the blessing in the world.
                                        And may Allah preserve our friendship till we are old and gray.
                                    </p>

                                    <p>
                                        Behind this letter lies a collection of messages, photos, and videos
                                        from everyone who loves you. Take your time,
                                        enjoy each one, and know that you are so incredibly loved.
                                    </p>

                                    <p>
                                        Here's to twenty.
                                    </p>

                                    <div className="pt-6 text-right">
                                        <p className="text-2xl font-['Great_Vibes'] text-pastel-pink">
                                            With all my heart,
                                        </p>
                                        <p className="text-xl text-gray-600 font-['Cormorant_Garamond']">
                                            Atiqah 💕
                                        </p>
                                        <p className="text-sm text-gray-400 mt-2 font-['Cormorant_Garamond']">
                                            {new Date().toLocaleDateString('en-US', {
                                                year: 'numeric',
                                                month: 'long',
                                                day: 'numeric'
                                            })}
                                        </p>
                                    </div>

                                    {/* Photo Section - Smaller with max width */}
                                    <div className="flex flex-col items-center my-8">
                                        <div className="max-w-sm md:max-w-md overflow-hidden rounded-lg shadow-xl border-2 border-pastel-pink/30">
                                            <img
                                                src="/images/thephoto.jpg"
                                                alt="You and Lynda"
                                                className="w-full h-auto"
                                                onError={(e) => {
                                                    console.error('Photo failed to load');
                                                    e.currentTarget.src = 'https://via.placeholder.com/800x600?text=Photo+unavailable';
                                                }}
                                            />
                                        </div>
                                        <p className="text-center text-gray-500 mt-3 font-['Cormorant_Garamond'] italic">
                                            That time I finally got to know you a little better... 💕
                                        </p>
                                    </div>
                                </div>

                                {/* Decorative divider */}
                                <div className="flex items-center justify-center gap-4 pt-8">
                                    <div className="w-12 h-px bg-pastel-pink/30" />
                                    <Heart className="w-4 h-4 text-pastel-pink/30" />
                                    <div className="w-12 h-px bg-pastel-pink/30" />
                                </div>

                                <p className="text-center text-sm text-gray-400 italic font-['Cormorant_Garamond']">
                                    "Your favourite Malaysian Abla."
                                </p>
                            </motion.div>
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}