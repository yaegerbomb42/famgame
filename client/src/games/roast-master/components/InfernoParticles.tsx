import React, { useEffect, useRef } from 'react';
import { EmberSystem } from './EmberSystem';

interface InfernoParticlesProps {
    intensity: number; // 0.0 to 2.0
}

const InfernoParticles: React.FC<InfernoParticlesProps> = ({ intensity }) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const systemRef = useRef<EmberSystem | null>(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        // Set correct dimensions
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;

        systemRef.current = new EmberSystem(ctx, canvas.width, canvas.height);

        const handleResize = () => {
            if (canvas && systemRef.current) {
                canvas.width = window.innerWidth;
                canvas.height = window.innerHeight;
                systemRef.current.setDimensions(canvas.width, canvas.height);
            }
        };

        const handleMouseMove = (e: MouseEvent) => {
            if (systemRef.current) {
                systemRef.current.updateMouse(e.clientX, e.clientY);
            }
        };

        window.addEventListener('resize', handleResize);
        window.addEventListener('mousemove', handleMouseMove);

        let animationFrame: number;
        const animate = () => {
            if (systemRef.current) {
                ctx.clearRect(0, 0, canvas.width, canvas.height);
                systemRef.current.setIntensity(intensity);
                systemRef.current.update();
                systemRef.current.draw();
            }
            animationFrame = requestAnimationFrame(animate);
        };
        animate();

        return () => {
            window.removeEventListener('resize', handleResize);
            window.removeEventListener('mousemove', handleMouseMove);
            cancelAnimationFrame(animationFrame);
        };
    }, [intensity]);

    // Update intensity without re-creating the system
    useEffect(() => {
        if (systemRef.current) {
            systemRef.current.setIntensity(intensity);
        }
    }, [intensity]);

    return (
        <canvas
            ref={canvasRef}
            className="fixed inset-0 pointer-events-none z-0"
            style={{ mixBlendMode: 'screen' }}
        />
    );
};

export default InfernoParticles;
