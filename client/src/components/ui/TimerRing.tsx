import React from 'react';
import { motion } from 'framer-motion';

interface TimerRingProps {
    timeLeft: number;
    maxTime: number;
    size?: number;
    strokeWidth?: number;
    accentColor?: string;
    accentGlow?: string;
    showNumber?: boolean;
    className?: string;
}

const TimerRing: React.FC<TimerRingProps> = ({
    timeLeft,
    maxTime,
    size = 120,
    strokeWidth = 8,
    accentColor = 'var(--color-cyan)',
    accentGlow = 'rgba(0,255,255,0.4)',
    showNumber = true,
    className = '',
}) => {
    const radius = (size - (strokeWidth + 4)) / 2;
    const circumference = 2 * Math.PI * radius;
    const progress = Math.max(0, Math.min(1, timeLeft / maxTime));
    const dashoffset = circumference * (1 - progress);

    const isUrgent = timeLeft <= 5;
    const isCritical = timeLeft <= 3;

    // Color transitions: accent → yellow → red
    const ringColor = isCritical
        ? '#ff1744'
        : isUrgent
        ? '#ffab00'
        : accentColor;

    const glowColor = isCritical
        ? 'rgba(255,23,68,0.6)'
        : isUrgent
        ? 'rgba(255,171,0,0.5)'
        : accentGlow;

    return (
        <motion.div
            className={`relative flex items-center justify-center ${className}`}
            style={{ width: size, height: size }}
            animate={isUrgent ? { scale: [1, 1.06, 1] } : {}}
            transition={isUrgent ? { repeat: Infinity, duration: isCritical ? 0.4 : 0.8 } : {}}
        >
            <svg
                width={size}
                height={size}
                viewBox={`0 0 ${size} ${size}`}
                className="absolute inset-0 -rotate-90"
                style={{ filter: `drop-shadow(0 0 12px ${glowColor})` }}
            >
                {/* Track */}
                <circle
                    cx={size / 2}
                    cy={size / 2}
                    r={radius}
                    fill="none"
                    stroke="rgba(255,255,255,0.08)"
                    strokeWidth={strokeWidth}
                />
                {/* Progress */}
                <motion.circle
                    cx={size / 2}
                    cy={size / 2}
                    r={radius}
                    fill="none"
                    stroke={ringColor}
                    strokeWidth={strokeWidth}
                    strokeLinecap="round"
                    strokeDasharray={circumference}
                    strokeDashoffset={dashoffset}
                    style={{ transition: 'stroke-dashoffset 0.3s ease, stroke 0.3s ease' }}
                />
            </svg>

            {showNumber && (
                <motion.span
                    className="relative z-10 font-black font-mono tabular-nums"
                    style={{
                        fontSize: size * 0.35,
                        color: ringColor,
                        textShadow: `0 0 15px ${glowColor}`,
                    }}
                    key={timeLeft}
                    initial={{ scale: 1.3, opacity: 0.6 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ duration: 0.15, ease: 'easeOut' }}
                >
                    {Math.ceil(timeLeft)}
                </motion.span>
            )}
        </motion.div>
    );
};

export default TimerRing;
