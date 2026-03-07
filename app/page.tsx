// ⚠️ CUSTOMIZE THIS: Change the birthday message if needed
'use client';

import { useState } from 'react';
import dynamic from 'next/dynamic';
import PasswordPopup from '@/components/PasswordPopup';
import BackgroundMusic from '@/components/BackgroundMusic';
import Link from 'next/link';
import { motion } from 'framer-motion';

// Dynamically import BirthdayAnimation with SSR disabled
// This fixes the "window is not defined" error during build
const BirthdayAnimation = dynamic(
  () => import('@/components/BirthdayAnimation'),
  { ssr: false }
);

export default function HomePage() {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <main
      className="min-h-screen bg-cover bg-center bg-no-repeat flex items-center justify-center"
      style={{
        backgroundImage: "url('/images/background.jpg')",
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
        backgroundColor: '#ce6e84ff', // fallback pink color
      }}
    >
      {/* Semi-transparent overlay - fixed to cover entire viewport */}
      <div className="fixed inset-0 bg-white/30 backdrop-blur-sm pointer-events-none"></div>
      {/* Floating Balloons - Full Page */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        {[...Array(12)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute text-4xl md:text-5xl"
            initial={{
              x: Math.random() * (typeof window !== 'undefined' ? window.innerWidth : 1000),
              y: (typeof window !== 'undefined' ? window.innerHeight : 800) + 100
            }}
            animate={{
              y: -200,
              x: Math.random() * (typeof window !== 'undefined' ? window.innerWidth : 1000),
              rotate: [0, 10, -10, 0]
            }}
            transition={{
              duration: 15 + Math.random() * 10,
              repeat: Infinity,
              delay: i * 2,
              ease: "linear"
            }}
          >
            {['🎈', '🎈', '🎈', '🎈', '🎈', '🎈', '🎈', '🎈', '🎈', '🎈', '🎈', '🎈'][i]}
          </motion.div>
        ))}
      </div>
      <div className="relative z-10 text-center p-8 max-w-2xl mx-auto">
        {/* Animated Birthday Text - Now loads only on client side */}
        <BirthdayAnimation name="Lynda" />

        {/* Big Clickable Button - Moderately Smaller */}
        <button
          onClick={() => setShowPassword(true)}
          className="mt-12 px-4 py-4 bg-pastel-pink text-gray-800 text-xl font-bold rounded-2xl shadow-xl 
             hover:scale-105 transform transition-all duration-300 
             border-4 border-white/50 backdrop-blur-sm
             hover:bg-pastel-yellow hover:shadow-2xl
             w-full max-w-md mx-auto block"
          style={{ backgroundColor: '#FFD1DC' }}
        >
          Open Your Surprise
        </button>

        {/* Small underlined text */}
        <Link
          href="/wish"
          className="block mt-4 text-sm text-gray-600 underline hover:text-pastel-pink transition-colors"
          style={{ fontSize: '0.875rem' }}
        >
          💌 Send birthday wishes to Lynda 💌
        </Link>
      </div>

      {/* Password Popup Modal */}
      {showPassword && (
        <PasswordPopup onClose={() => setShowPassword(false)} />
      )}

      {/* Background Music Component */}
      <BackgroundMusic />
    </main>
  );
}