import React, { useEffect } from 'react';
import confetti from 'canvas-confetti';
import { useGameStore } from '../store/useGameStore';

export const CelebrationOverlay: React.FC = () => {
    const { gameState } = useGameStore();
    const phase = gameState?.gameData?.phase;
    const roundResults = gameState?.gameData?.roundResults;

    useEffect(() => {
        // Trigger on REVEAL if any points were awarded
        if (phase === 'REVEAL' && roundResults) {
            const anyoneScored = Object.values(roundResults).some((r: any) => r.points > 0);
            if (anyoneScored) {
                const duration = 3 * 1000;
                const animationEnd = Date.now() + duration;
                const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 0 };

                const randomInRange = (min: number, max: number) => Math.random() * (max - min) + min;

                const interval: any = setInterval(() => {
                    const timeLeft = animationEnd - Date.now();

                    if (timeLeft <= 0) {
                        return clearInterval(interval);
                    }

                    const particleCount = 50 * (timeLeft / duration);
                    confetti({ ...defaults, particleCount, origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 } });
                    confetti({ ...defaults, particleCount, origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 } });
                }, 250);
            }
        }

        // Massive burst on RESULTS
        if (phase === 'RESULTS') {
            confetti({
                particleCount: 150,
                spread: 70,
                origin: { y: 0.6 },
                colors: ['#00ffff', '#ff00ff', '#ffff00']
            });
        }
    }, [phase, roundResults]);

    return null; // Side-effect component
};
