// ⚠️ CUSTOMIZE THIS: Change the birthday message if needed
'use client';

import { useState } from 'react';
import BirthdayAnimation from '@/components/BirthdayAnimation';
import PasswordPopup from '@/components/PasswordPopup';
import BackgroundMusic from '@/components/BackgroundMusic';
import Link from 'next/link';

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
      {/* Semi-transparent overlay for better text readability */}
      {/* Semi-transparent overlay - fixed to cover entire viewport */}
      <div className="fixed inset-0 bg-white/30 backdrop-blur-sm pointer-events-none"></div>

      <div className="relative z-10 text-center p-8 max-w-2xl mx-auto">
        {/* Animated Birthday Text */}
        <BirthdayAnimation name="Lynda" />

        {/* Big Clickable Button */}
        <button
          onClick={() => setShowPassword(true)}
          className="mt-12 px-12 py-5 bg-pastel-pink text-gray-800 text-2xl font-bold rounded-2xl shadow-xl 
                     hover:scale-105 transform transition-all duration-300 
                     border-4 border-white/50 backdrop-blur-sm
                     hover:bg-pastel-yellow hover:shadow-2xl
                     w-full max-w-md mx-auto block"
          style={{ backgroundColor: '#FFD1DC' }}
        >
          🎁 Open Your Surprise 🎁
        </button>

        {/* Small underlined text */}
        <Link
          href="/wish"
          className="block mt-4 text-sm text-gray-600 underline hover:text-pastel-pink transition-colors"
          style={{ fontSize: '0.875rem' }}
        >
          Send birthday wishes to Lynda
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