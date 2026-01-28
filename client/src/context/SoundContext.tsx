/* eslint-disable react-refresh/only-export-components */
import React, { createContext, useContext, useRef, useState } from 'react';

declare global {
    interface Window {
        webkitAudioContext: typeof AudioContext;
    }
}

interface SoundContextType {
    playHover: () => void;
    playClick: () => void;
    playSuccess: () => void;
    playError: () => void;
    playBuzz: () => void;
    playPing: () => void;
    setBGM: (mode: 'LOBBY' | 'GAME' | 'NONE') => void;
}

const SoundContext = createContext<SoundContextType | null>(null);

export const useSound = () => {
    const context = useContext(SoundContext);
    if (!context) throw new Error('useSound must be used within a SoundProvider');
    return context;
};

export const SoundProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const audioCtxRef = useRef<AudioContext | null>(null);
    const bgmNodeRef = useRef<AudioNode | null>(null);
    const [currentBGM, setCurrentBGM] = useState<'LOBBY' | 'GAME' | 'NONE'>('NONE');

    const getCtx = () => {
        if (!audioCtxRef.current) {
            const AudioContext = window.AudioContext || window.webkitAudioContext;
            audioCtxRef.current = new AudioContext();
        }
        if (audioCtxRef.current.state === 'suspended') {
            audioCtxRef.current.resume();
        }
        return audioCtxRef.current;
    }

    const playHover = () => {
        const ctx = getCtx();
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.type = 'sine';
        osc.frequency.setValueAtTime(400, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(600, ctx.currentTime + 0.05);
        gain.gain.setValueAtTime(0.02, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.05);
        osc.start();
        osc.stop(ctx.currentTime + 0.05);
    };

    const playClick = () => {
        const ctx = getCtx();
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(150, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(50, ctx.currentTime + 0.1);
        gain.gain.setValueAtTime(0.05, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.1);
        osc.start();
        osc.stop(ctx.currentTime + 0.1);
    };

    const playSuccess = () => {
        const ctx = getCtx();
        const now = ctx.currentTime;
        [440, 554, 659, 880].forEach((freq, i) => {
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.connect(gain);
            gain.connect(ctx.destination);
            osc.type = 'sine';
            osc.frequency.value = freq;
            gain.gain.setValueAtTime(0.05, now + i * 0.05);
            gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.05 + 0.3);
            osc.start(now + i * 0.05);
            osc.stop(now + i * 0.05 + 0.3);
        });
    };

    const playError = () => {
        const ctx = getCtx();
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(100, ctx.currentTime);
        osc.frequency.linearRampToValueAtTime(50, ctx.currentTime + 0.3);
        gain.gain.setValueAtTime(0.05, ctx.currentTime);
        gain.gain.linearRampToValueAtTime(0.001, ctx.currentTime + 0.3);
        osc.start();
        osc.stop(ctx.currentTime + 0.3);
    };

    const playBuzz = () => {
        const ctx = getCtx();
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.type = 'square';
        osc.frequency.setValueAtTime(400, ctx.currentTime);
        osc.frequency.linearRampToValueAtTime(200, ctx.currentTime + 0.5);
        gain.gain.setValueAtTime(0.1, ctx.currentTime);
        gain.gain.linearRampToValueAtTime(0.001, ctx.currentTime + 0.5);
        osc.start();
        osc.stop(ctx.currentTime + 0.5);
    };

    const playPing = () => {
        const ctx = getCtx();
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.type = 'sine';
        osc.frequency.setValueAtTime(800, ctx.currentTime);
        gain.gain.setValueAtTime(0.05, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.5);
        osc.start();
        osc.stop(ctx.currentTime + 0.5);
    }

    const startBGM = (mode: 'LOBBY' | 'GAME') => {
        const ctx = getCtx();
        if (bgmNodeRef.current) {
            bgmNodeRef.current.disconnect();
        }

        const masterGain = ctx.createGain();
        masterGain.gain.value = 0.03;
        masterGain.connect(ctx.destination);

        // Simple procedural BGM loop
        const tempo = mode === 'LOBBY' ? 120 : 140;

        const scheduleNote = (time: number, freq: number, duration: number) => {
            const osc = ctx.createOscillator();
            const g = ctx.createGain();
            osc.connect(g);
            g.connect(masterGain);
            osc.type = mode === 'LOBBY' ? 'sine' : 'triangle';
            osc.frequency.setValueAtTime(freq, time);
            g.gain.setValueAtTime(0.1, time);
            g.gain.exponentialRampToValueAtTime(0.001, time + duration);
            osc.start(time);
            osc.stop(time + duration);
        }

        const playLoop = () => {
            const now = ctx.currentTime;
            const step = 60 / tempo / 2; // 8th notes

            for (let i = 0; i < 16; i++) {
                const t = now + i * step;
                if (mode === 'LOBBY') {
                    // Chill bassline
                    if (i % 4 === 0) scheduleNote(t, 110, step * 2);
                    if (i % 8 === 2) scheduleNote(t, 130, step);
                } else {
                    // Hype bassline
                    if (i % 2 === 0) scheduleNote(t, 80, step);
                    if (i % 4 === 1) scheduleNote(t, 160, step / 2);
                }
            }
        };

        const interval = setInterval(playLoop, (16 * 60 / tempo / 2) * 1000);
        playLoop();

        // Wrap interval in a fake AudioNode for disposal
        bgmNodeRef.current = {
            disconnect: () => {
                clearInterval(interval);
                masterGain.disconnect();
            }
        } as any;
    };

    const setBGM = (mode: 'LOBBY' | 'GAME' | 'NONE') => {
        if (mode === currentBGM) return;
        setCurrentBGM(mode);
        if (mode === 'NONE') {
            if (bgmNodeRef.current) {
                bgmNodeRef.current.disconnect();
                bgmNodeRef.current = null;
            }
        } else {
            startBGM(mode);
        }
    }

    return (
        <SoundContext.Provider value={{ playHover, playClick, playSuccess, playError, playBuzz, playPing, setBGM }}>
            {children}
        </SoundContext.Provider>
    );
};