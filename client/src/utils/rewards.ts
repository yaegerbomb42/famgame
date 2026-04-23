import confetti from 'canvas-confetti';

export const triggerHypeConfetti = (x: number = 0.5, y: number = 0.6) => {
    confetti({
        particleCount: 150,
        spread: 80,
        origin: { x, y },
        colors: ['#00ffff', '#ff00ff', '#ffffff', '#00ff00'],
        gravity: 0.8,
        scalar: 1.2
    });
};

export const triggerSavageParticles = (x: number = 0.5, y: number = 0.6) => {
    confetti({
        particleCount: 80,
        spread: 120,
        origin: { x, y },
        colors: ['#ff0000', '#800080', '#1a1040'],
        gravity: 1.2,
        scalar: 0.8,
        ticks: 100
    });
};

export const triggerRoundWinConfetti = () => {
    const duration = 3000;
    const end = Date.now() + duration;

    (function frame() {
        confetti({
            particleCount: 5,
            angle: 60,
            spread: 55,
            origin: { x: 0 },
            colors: ['#00ffff', '#ff00ff']
        });
        confetti({
            particleCount: 5,
            angle: 120,
            spread: 55,
            origin: { x: 1 },
            colors: ['#00ffff', '#ff00ff']
        });

        if (Date.now() < end) {
            requestAnimationFrame(frame);
        }
    }());
};
