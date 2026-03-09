'use client';

import { Volume2, VolumeX } from 'lucide-react';
import { useMusic } from '@/context/MusicContext';
import { motion } from 'framer-motion';

interface MusicButtonProps {
    position?: 'top-right' | 'bottom-right' | 'inside-card';
    className?: string;
}

export default function MusicButton({ position: propPosition, className = '' }: MusicButtonProps) {
    const { isPlaying, isMuted, toggleMute, buttonPosition: contextPosition } = useMusic();

    // Use prop position if provided, otherwise use context position
    const position = propPosition || contextPosition;

    // Position classes
    const positionClasses = {
        'top-right': 'fixed top-6 right-6',
        'bottom-right': 'fixed bottom-6 right-6',
        'inside-card': 'absolute bottom-8 right-8',
    };

    return (
        <motion.button
            onClick={toggleMute}
            className={`z-50 bg-white/90 backdrop-blur-sm p-4 rounded-full shadow-xl hover:scale-110 transition-all duration-300 border-2 border-pastel-pink ${positionClasses[position]} ${className}`}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            animate={position === 'inside-card' ? {
                scale: [1, 1.1, 1],
            } : {}}
            transition={position === 'inside-card' ? {
                duration: 1.5,
                repeat: Infinity,
                repeatType: "reverse"
            } : {}}
        >
            {isPlaying && !isMuted ? (
                <Volume2 size={24} style={{ color: '#FFD1DC' }} />
            ) : (
                <VolumeX size={24} style={{ color: '#A7C7E7' }} />
            )}
        </motion.button>
    );
}