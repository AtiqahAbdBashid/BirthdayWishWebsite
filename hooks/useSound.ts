import { useRef, useCallback } from 'react';

export const useSound = (soundPath: string, volume: number = 0.3) => {
    const audioRef = useRef<HTMLAudioElement | null>(null);

    const play = useCallback(() => {
        try {
            if (!audioRef.current) {
                audioRef.current = new Audio(soundPath);
                audioRef.current.volume = volume;
            }

            // Reset and play
            audioRef.current.currentTime = 0;
            audioRef.current.play().catch(err => {
                // Autoplay restrictions - user interaction already happened, so this should work
                console.log('Sound play failed:', err);
            });
        } catch (error) {
            console.log('Sound error:', error);
        }
    }, [soundPath, volume]);

    return play;
};