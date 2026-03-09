'use client';

import React, { createContext, useContext, useRef, useState, useEffect } from 'react';

interface MusicContextType {
    isPlaying: boolean;
    isMuted: boolean;
    toggleMute: () => void;
    buttonPosition: 'top-right' | 'bottom-right' | 'inside-card';
    setButtonPosition: (position: 'top-right' | 'bottom-right' | 'inside-card') => void;
}

const MusicContext = createContext<MusicContextType | undefined>(undefined);

export function MusicProvider({ children }: { children: React.ReactNode }) {
    const [isPlaying, setIsPlaying] = useState(false);
    const [isMuted, setIsMuted] = useState(true);
    const [buttonPosition, setButtonPosition] = useState<'top-right' | 'bottom-right' | 'inside-card'>('bottom-right');
    const [userInteracted, setUserInteracted] = useState(false);
    const audioRef = useRef<HTMLAudioElement | null>(null);

    // Create audio element once
    useEffect(() => {
        audioRef.current = new Audio('/music/birthday-song.mp3');
        audioRef.current.loop = true;
        audioRef.current.volume = 0.4;
        audioRef.current.muted = true;

        // Try to load the audio
        audioRef.current.load();

        // Cleanup
        return () => {
            if (audioRef.current) {
                audioRef.current.pause();
                audioRef.current = null;
            }
        };
    }, []);

    // Attempt to play when user interacts with the page
    useEffect(() => {
        const handleUserInteraction = () => {
            if (!userInteracted && audioRef.current) {
                setUserInteracted(true);
                audioRef.current.play()
                    .then(() => {
                        setIsPlaying(true);
                        setIsMuted(true);
                        console.log('Music started successfully');
                    })
                    .catch(err => {
                        console.log('Music play failed:', err);
                    });
            }
        };

        // Listen for any user interaction
        document.addEventListener('click', handleUserInteraction);
        document.addEventListener('touchstart', handleUserInteraction);
        document.addEventListener('keydown', handleUserInteraction);

        return () => {
            document.removeEventListener('click', handleUserInteraction);
            document.removeEventListener('touchstart', handleUserInteraction);
            document.removeEventListener('keydown', handleUserInteraction);
        };
    }, [userInteracted]);

    const toggleMute = () => {
        if (audioRef.current) {
            const newMuted = !audioRef.current.muted;
            audioRef.current.muted = newMuted;
            setIsMuted(newMuted);

            // If music isn't playing yet, try to play
            if (!isPlaying && !newMuted) {
                audioRef.current.play()
                    .then(() => setIsPlaying(true))
                    .catch(err => console.log('Play failed:', err));
            }
        }
    };

    return (
        <MusicContext.Provider value={{
            isPlaying,
            isMuted,
            toggleMute,
            buttonPosition,
            setButtonPosition
        }}>
            {children}
        </MusicContext.Provider>
    );
}

export function useMusic() {
    const context = useContext(MusicContext);
    if (context === undefined) {
        throw new Error('useMusic must be used within a MusicProvider');
    }
    return context;
}