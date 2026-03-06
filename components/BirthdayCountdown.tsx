'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

interface TimeLeft {
    days: number;
    hours: number;
    minutes: number;
    seconds: number;
}

export default function BirthdayCountdown() {
    const [timeLeft, setTimeLeft] = useState<TimeLeft>({ days: 0, hours: 0, minutes: 0, seconds: 0 });
    const [isBirthday, setIsBirthday] = useState(false);

    useEffect(() => {
        // ⚠️ CUSTOMIZE THIS: Set Lynda's birthday date here
        // Format: Year, Month (0-11), Day
        // For March 6, 2026: new Date(2026, 2, 6)
        const birthdayDate = new Date(2026, 2, 12); // March 6, 2026 (month is 0-indexed)

        const calculateTimeLeft = () => {
            const now = new Date();
            const currentYear = now.getFullYear();

            // Set birthday for current year
            let targetBirthday = new Date(currentYear, birthdayDate.getMonth(), birthdayDate.getDate());

            // If birthday has passed this year, use next year's
            if (now > targetBirthday) {
                targetBirthday = new Date(currentYear + 1, birthdayDate.getMonth(), birthdayDate.getDate());
            }

            const difference = targetBirthday.getTime() - now.getTime();

            if (difference > 0) {
                setIsBirthday(false);
                setTimeLeft({
                    days: Math.floor(difference / (1000 * 60 * 60 * 24)),
                    hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
                    minutes: Math.floor((difference / 1000 / 60) % 60),
                    seconds: Math.floor((difference / 1000) % 60)
                });
            } else {
                setIsBirthday(true);
            }
        };

        calculateTimeLeft();
        const timer = setInterval(calculateTimeLeft, 1000);

        return () => clearInterval(timer);
    }, []);

    if (isBirthday) {
        return (
            <motion.div
                className="bg-gradient-to-r from-pastel-pink to-pastel-yellow rounded-lg p-2 mb-4 text-center"
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.5 }}
            >
                <p className="text-sm font-bold text-gray-800">
                    🎉 TODAY IS THE DAY! HAPPY BIRTHDAY LYNDA! 🎉
                </p>
            </motion.div>
        );
    }

    return (
        <div className="flex flex-col items-center w-full mb-4">
            <motion.div
                className="bg-white/80 backdrop-blur-sm rounded-lg p-2 shadow border border-pastel-pink/30"
                initial={{ y: -10, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.3 }}
            >
                <div className="flex items-center justify-center gap-3">
                    {/* Days */}
                    <div className="text-center">
                        <motion.div
                            className="text-lg font-bold"
                            style={{ color: '#d45673ff' }}
                            animate={{ scale: [1, 1.05, 1] }}
                            transition={{ duration: 1, repeat: Infinity }}
                        >
                            {timeLeft.days}d
                        </motion.div>
                    </div>

                    <span className="text-gray-400 text-xs">•</span>

                    {/* Hours */}
                    <div className="text-center">
                        <div className="text-lg font-bold" style={{ color: '#6295c8ff' }}>
                            {timeLeft.hours}h
                        </div>
                    </div>

                    <span className="text-gray-400 text-xs">•</span>

                    {/* Minutes */}
                    <div className="text-center">
                        <div className="text-lg font-bold" style={{ color: '#c4c456ff' }}>
                            {timeLeft.minutes}m
                        </div>
                    </div>

                    <span className="text-gray-400 text-xs">•</span>

                    {/* Seconds */}
                    <div className="text-center">
                        <motion.div
                            className="text-lg font-bold"
                            style={{ color: '#d45673ff' }}
                            animate={{ scale: [1, 1.1, 1] }}
                            transition={{ duration: 0.5, repeat: Infinity }}
                        >
                            {timeLeft.seconds}s
                        </motion.div>
                    </div>
                </div>
            </motion.div>

            {/* Label below the countdown */}
            <motion.p
                className="text-xs text-gray-500 mt-1 italic"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2, duration: 0.3 }}
            >
                until Lynda's birthday 🎂
            </motion.p>
        </div>
    );
}