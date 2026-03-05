'use client';

import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';

interface Props {
    name: string;
}

export default function BirthdayAnimation({ name }: Props) {
    const [sparkles, setSparkles] = useState<Array<{ id: number; x: number; y: number }>>([]);

    useEffect(() => {
        // Add random sparkles
        const interval = setInterval(() => {
            setSparkles(prev => {
                const newSparkle = {
                    id: Date.now(),
                    x: Math.random() * 100,
                    y: Math.random() * 100,
                };
                return [...prev.slice(-5), newSparkle]; // Keep last 5 sparkles
            });
        }, 500);

        return () => clearInterval(interval);
    }, []);

    return (

        <div className="relative">

            <motion.h1
                className="text-6xl md:text-7xl font-bold mb-4 relative"
                initial={{ scale: 0.5, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.8, type: "spring", bounce: 0.5 }}
            >
                <span className="block" style={{ color: '#A7C7E7' }}>Happy Birthday</span>
                <motion.span
                    className="block text-7xl md:text-8xl mt-2 relative"
                    style={{ color: '#FFD1DC' }}
                    animate={{
                        scale: [1, 1.1, 1],
                        rotate: [0, 2, -2, 0]
                    }}
                    transition={{
                        duration: 2,
                        repeat: Infinity,
                        repeatType: "reverse"
                    }}
                >
                    {name}!
                    {/* Sparkles */}
                    {sparkles.map(sparkle => (
                        <motion.span
                            key={sparkle.id}
                            className="absolute text-4xl"
                            initial={{ opacity: 1, scale: 0 }}
                            animate={{ opacity: 0, scale: 1.5 }}
                            transition={{ duration: 1 }}
                            style={{
                                left: `${sparkle.x}%`,
                                top: `${sparkle.y}%`,
                                transform: 'translate(-50%, -50%)'
                            }}
                        >
                            ✨
                        </motion.span>
                    ))}
                </motion.span>
            </motion.h1>


            {/* Decorative balloons */}
            <div className="flex justify-center gap-4 mt-4">
                {['🎈', '🎈', '🎈'].map((balloon, i) => (
                    <motion.span
                        key={i}
                        className="text-4xl"
                        animate={{
                            y: [-10, 10, -10],
                            rotate: [-5, 5, -5]
                        }}
                        transition={{
                            duration: 2 + i,
                            repeat: Infinity,
                            delay: i * 0.3
                        }}
                    >
                        {balloon}
                    </motion.span>
                ))}
            </div>

            {/* Floating Balloons */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden">
                {[...Array(6)].map((_, i) => (
                    <motion.div
                        key={i}
                        className="absolute text-4xl"
                        initial={{
                            x: Math.random() * window.innerWidth,
                            y: window.innerHeight + 100
                        }}
                        animate={{
                            y: -100,
                            x: Math.random() * window.innerWidth
                        }}
                        transition={{
                            duration: 10 + Math.random() * 10,
                            repeat: Infinity,
                            delay: i * 2
                        }}
                    >
                        {['🎈', '🎈', '🎈', '🎈', '🎈', '🎈'][i]}
                    </motion.div>
                ))}

            </div>


        </div>
    );
}