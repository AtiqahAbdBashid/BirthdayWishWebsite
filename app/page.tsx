// ⚠️ CUSTOMIZE THIS: Change the birthday message if needed
'use client';

import { useState, useEffect, useRef } from 'react';
import dynamic from 'next/dynamic';
import PasswordPopup from '@/components/PasswordPopup';
import BackgroundMusic from '@/components/BackgroundMusic';
import Link from 'next/link';
import { motion } from 'framer-motion';

// Import ONLY ONE petals component (choose which one you want)
import PetalsEffect from '@/components/JapanesePetals'; // Use this one

// Dynamically import BirthdayAnimation with SSR disabled
const BirthdayAnimation = dynamic(
  () => import('@/components/BirthdayAnimation'),
  { ssr: false }
);

export default function HomePage() {
  const [showPassword, setShowPassword] = useState(false);
  const [windowWidth, setWindowWidth] = useState(0);
  const [slideWidth, setSlideWidth] = useState(1000);
  const carouselRef = useRef<HTMLDivElement>(null);

  // Calculate carousel width
  useEffect(() => {
    const calculateWidth = () => {
      if (carouselRef.current) {
        const firstSet = carouselRef.current.children;
        let totalWidth = 0;

        // Sum up the widths of all items in one set (first 5 items)
        for (let i = 0; i < 5; i++) {
          if (firstSet[i]) {
            totalWidth += (firstSet[i] as HTMLElement).offsetWidth;

            // Add gap between items (12px on mobile, 16px on desktop)
            if (i < 4) {
              totalWidth += window.innerWidth < 640 ? 12 : 16;
            }
          }
        }

        if (totalWidth > 0) {
          setSlideWidth(totalWidth);
        }
      }
    };

    // Calculate after a short delay to ensure DOM is ready
    setTimeout(calculateWidth, 100);

    // Recalculate on resize
    window.addEventListener('resize', calculateWidth);

    return () => window.removeEventListener('resize', calculateWidth);
  }, []);

  useEffect(() => {
    setWindowWidth(window.innerWidth);

    const handleResize = () => {
      setWindowWidth(window.innerWidth);
    };

    window.addEventListener('resize', handleResize);

    const style = document.createElement('style');
    style.innerHTML = `
      * {
        -webkit-tap-highlight-color: transparent;
        -webkit-touch-callout: none;
      }
    `;
    document.head.appendChild(style);

    return () => {
      window.removeEventListener('resize', handleResize);
      document.head.removeChild(style);
    };
  }, []);

  return (
    <main
      className="min-h-screen bg-cover bg-center bg-no-repeat flex flex-col items-center justify-center"
      style={{
        backgroundImage: "url('/images/background.jpg')",
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
        backgroundColor: '#ce6e84ff',
        transform: 'translateZ(0)',
        WebkitFontSmoothing: 'antialiased',
      }}
    >
      {/* Semi-transparent overlay */}
      <div
        className="fixed inset-0 bg-white/30 backdrop-blur-sm pointer-events-none"
        style={{
          WebkitBackdropFilter: 'blur(4px)',
          backdropFilter: 'blur(4px)',
        }}
      />

      {/* Japanese Petals Effect */}
      <PetalsEffect />

      {/* Main Content - Separated from carousel */}
      <div className="relative z-10 text-center p-8 max-w-2xl mx-auto w-full">
        <BirthdayAnimation name="Lynda" />
      </div>

      {/* Floating Polaroid Carousel - TRULY SEAMLESS */}
      <div className="relative z-10 w-full overflow-hidden py-2 sm:py-4 mt-0 sm:mt-2">
        <motion.div
          ref={carouselRef}
          className="flex gap-3 sm:gap-4"
          animate={{
            x: [0, -slideWidth], // Animate exactly one set width
          }}
          transition={{
            x: {
              duration: 20,
              repeat: Infinity,
              ease: "linear",
              repeatType: "loop",
            },
          }}
          style={{
            width: 'fit-content',
            willChange: 'transform',
          }}
        >
          {/* Render THREE sets of polaroids for extra smooth loop */}
          {[...Array(15)].map((_, index) => { // 15 items = 3 sets of 5
            const actualIndex = index % 5;
            return (
              <motion.div
                key={index}
                className="flex-shrink-0 w-24 sm:w-32 md:w-40 bg-white p-1.5 sm:p-2 rounded-lg shadow-xl transform hover:scale-105 transition-transform cursor-pointer touch-manipulation"
                style={{
                  rotate: actualIndex % 2 === 0 ? '3deg' : '-3deg',
                  boxShadow: '0 8px 20px -5px rgba(0, 0, 0, 0.2)',
                  WebkitTapHighlightColor: 'transparent',
                }}
                whileHover={{ rotate: 0, y: -8 }}
                whileTap={{ scale: 0.95 }}
              >
                <img
                  src={`/images/memories/photo-${actualIndex + 1}.jpg`}
                  alt={`Memory ${actualIndex + 1}`}
                  className="w-full h-20 sm:h-24 md:h-32 object-cover rounded-md"
                />
                <p className="text-center text-xs font-medium text-gray-700 truncate px-1 opacity-0">
                  Poloroid {actualIndex + 1}
                </p>
                <p className="text-center text-xs text-gray-500 opacity-0">
                  2025
                </p>
              </motion.div>
            );
          })}
        </motion.div>
      </div>

      {/* Button Container */}
      <div className="relative z-10 text-center p-8 max-w-2xl mx-auto w-full">
        <button
          onClick={() => setShowPassword(true)}
          className="mt-2 sm:mt-4 px-4 py-4 bg-pastel-pink text-gray-800 text-xl font-bold rounded-2xl shadow-xl 
          hover:scale-105 transform transition-all duration-300
          border-4 border-white/50 backdrop-blur-sm
          hover:bg-pastel-yellow hover:shadow-2xl
          w-56 sm:w-64 mx-auto block touch-manipulation select-none"
          style={{
            backgroundColor: '#FFD1DC',
            WebkitTapHighlightColor: 'transparent',
          }}
        >
          Open Your Surprise
        </button>

        <Link
          href="/wish"
          className="block mt-4 text-sm text-white-600 underline hover:text-pastel-pink transition-colors touch-manipulation"
          style={{
            fontSize: '1.0rem',
            WebkitTapHighlightColor: 'transparent',
          }}
        >
          💌 Send birthday wish to Lynda 💌
        </Link>
      </div>

      {showPassword && (
        <PasswordPopup onClose={() => setShowPassword(false)} />
      )}

      <BackgroundMusic />
    </main>
  );
}