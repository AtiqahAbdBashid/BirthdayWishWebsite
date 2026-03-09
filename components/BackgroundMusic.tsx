'use client';

import MusicButton from './MusicButton';

export default function BackgroundMusic() {
    return (
        <div style={{ position: 'fixed', top: '24px', right: '24px', zIndex: 9999 }}>
            <MusicButton />
        </div>
    );
}