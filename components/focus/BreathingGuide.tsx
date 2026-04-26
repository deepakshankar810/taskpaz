'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export function BreathingGuide() {
    const [phase, setPhase] = useState<'inhale' | 'hold' | 'exhale'>('inhale');

    useEffect(() => {
        const timer = setInterval(() => {
            setPhase((prev) => {
                if (prev === 'inhale') return 'hold';
                if (prev === 'hold') return 'exhale';
                return 'inhale';
            });
        }, 4000); // 4s for each phase

        return () => clearInterval(timer);
    }, []);

    const text = {
        inhale: 'Breathe In',
        hold: 'Hold',
        exhale: 'Breathe Out'
    };

    return (
        <div className="flex flex-col items-center justify-center p-8 text-center">
            <div className="relative flex items-center justify-center w-64 h-64">
                {/* Background pulse */}
                <motion.div
                    animate={{
                        scale: phase === 'inhale' ? 1.5 : phase === 'hold' ? 1.5 : 1,
                        opacity: phase === 'inhale' ? 0.3 : 0.1
                    }}
                    transition={{ duration: 4, ease: "easeInOut" }}
                    className="absolute w-40 h-40 rounded-full bg-blue-400/20 blur-xl"
                />
                
                {/* Main Circle */}
                <motion.div
                    animate={{
                        scale: phase === 'inhale' ? 1.5 : phase === 'hold' ? 1.5 : 1,
                    }}
                    transition={{ duration: 4, ease: "easeInOut" }}
                    className="w-32 h-32 rounded-full border-4 border-blue-500 shadow-[0_0_20px_rgba(59,130,246,0.5)] flex items-center justify-center bg-white dark:bg-slate-900 z-10"
                >
                    <AnimatePresence mode="wait">
                        <motion.span
                            key={phase}
                            initial={{ opacity: 0, y: 5 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -5 }}
                            className="text-sm font-medium text-blue-600 dark:text-blue-400"
                        >
                            {text[phase]}
                        </motion.span>
                    </AnimatePresence>
                </motion.div>

                {/* Outer Ring */}
                <motion.div
                    animate={{
                        scale: phase === 'inhale' ? 1.8 : phase === 'hold' ? 1.8 : 1,
                        rotate: 360
                    }}
                    transition={{ duration: 12, repeat: Infinity, ease: "linear" }}
                    className="absolute w-48 h-48 rounded-full border border-dashed border-blue-300/50"
                />
            </div>
            <p className="mt-8 text-slate-500 text-sm max-w-[200px]">
                Take a moment to center yourself during your break.
            </p>
        </div>
    );
}
