import React, { createContext, useContext, useRef, useState, useCallback, useMemo } from 'react';

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
    playCountdown: () => void;
    playDrumroll: () => void;
    setBGM: (mode: 'LOBBY' | 'GAME' | 'RESULTS' | 'NONE') => void;
    bgmVolume: number;
    setBgmVolume: (vol: number) => void;
}

const SoundContext = createContext<SoundContextType | null>(null);

export const useSound = () => {
    const context = useContext(SoundContext);
    if (!context) throw new Error('useSound must be used within a SoundProvider');
    return context;
};

// ═══════════════════════════════════════════════════
// 🎵 PREMIUM PROCEDURAL BGM ENGINE
// Lo-fi chill for lobby, synth-wave hype for gameplay
// ═══════════════════════════════════════════════════

// Musical scale helpers
const NOTE_FREQS: Record<string, number> = {
    'C3': 130.81, 'D3': 146.83, 'E3': 164.81, 'F3': 174.61, 'G3': 196.00, 'A3': 220.00, 'B3': 246.94,
    'C4': 261.63, 'D4': 293.66, 'E4': 329.63, 'F4': 349.23, 'G4': 392.00, 'A4': 440.00, 'B4': 493.88,
    'C5': 523.25, 'D5': 587.33, 'E5': 659.25, 'G5': 783.99,
};

// Chord progressions
const LOBBY_CHORDS = [
    ['C3', 'E4', 'G4', 'B4'],     // Cmaj7
    ['A3', 'C4', 'E4', 'G4'],     // Am7
    ['F3', 'A4', 'C5', 'E5'],     // Fmaj7
    ['G3', 'B4', 'D5', 'G5'],     // Gmaj7
];

const GAME_CHORDS = [
    ['E3', 'B4', 'E5'],           // Em power
    ['G3', 'D4', 'G4'],           // G power
    ['A3', 'E4', 'A4'],           // Am power
    ['C3', 'G4', 'C5'],           // C power
];

const RESULTS_CHORDS = [
    ['C4', 'E4', 'G4', 'C5'],    // Triumphant C
    ['F3', 'A4', 'C5'],           // F major
    ['G3', 'B4', 'D5'],           // G major
    ['C4', 'E5', 'G5'],           // C high
];

export const SoundProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const audioCtxRef = useRef<AudioContext | null>(null);
    const bgmCleanupRef = useRef<(() => void) | null>(null);
    const [currentBGM, setCurrentBGM] = useState<'LOBBY' | 'GAME' | 'RESULTS' | 'NONE'>('NONE');
    const [bgmVolume, setBgmVolume] = useState(0.04);
    const bgmVolumeRef = useRef(0.04);

    const getCtx = useCallback(() => {
        if (!audioCtxRef.current) {
            const AudioContextClass = window.AudioContext || window.webkitAudioContext;
            audioCtxRef.current = new AudioContextClass();
        }
        if (audioCtxRef.current.state === 'suspended') {
            audioCtxRef.current.resume();
        }
        return audioCtxRef.current;
    }, []);

    // ── SFX ──────────────────────────────────────────
    const playHover = useCallback(() => {
        const ctx = getCtx();
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain).connect(ctx.destination);
        osc.type = 'sine';
        osc.frequency.setValueAtTime(500, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(700, ctx.currentTime + 0.04);
        gain.gain.setValueAtTime(0.015, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.04);
        osc.start(); osc.stop(ctx.currentTime + 0.04);
    }, [getCtx]);

    const playClick = useCallback(() => {
        const ctx = getCtx();
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain).connect(ctx.destination);
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(180, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(60, ctx.currentTime + 0.08);
        gain.gain.setValueAtTime(0.06, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.08);
        osc.start(); osc.stop(ctx.currentTime + 0.08);
    }, [getCtx]);

    const playSuccess = useCallback(() => {
        const ctx = getCtx();
        const now = ctx.currentTime;
        [523, 659, 784, 1047].forEach((freq, i) => {
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.connect(gain).connect(ctx.destination);
            osc.type = 'sine';
            osc.frequency.value = freq;
            gain.gain.setValueAtTime(0.06, now + i * 0.06);
            gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.06 + 0.25);
            osc.start(now + i * 0.06);
            osc.stop(now + i * 0.06 + 0.25);
        });
    }, [getCtx]);

    const playError = useCallback(() => {
        const ctx = getCtx();
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain).connect(ctx.destination);
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(120, ctx.currentTime);
        osc.frequency.linearRampToValueAtTime(40, ctx.currentTime + 0.35);
        gain.gain.setValueAtTime(0.04, ctx.currentTime);
        gain.gain.linearRampToValueAtTime(0.001, ctx.currentTime + 0.35);
        osc.start(); osc.stop(ctx.currentTime + 0.35);
    }, [getCtx]);

    const playBuzz = useCallback(() => {
        const ctx = getCtx();
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain).connect(ctx.destination);
        osc.type = 'square';
        osc.frequency.setValueAtTime(500, ctx.currentTime);
        osc.frequency.linearRampToValueAtTime(250, ctx.currentTime + 0.4);
        gain.gain.setValueAtTime(0.08, ctx.currentTime);
        gain.gain.linearRampToValueAtTime(0.001, ctx.currentTime + 0.4);
        osc.start(); osc.stop(ctx.currentTime + 0.4);
    }, [getCtx]);

    const playPing = useCallback(() => {
        const ctx = getCtx();
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain).connect(ctx.destination);
        osc.type = 'sine';
        osc.frequency.setValueAtTime(900, ctx.currentTime);
        gain.gain.setValueAtTime(0.05, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.4);
        osc.start(); osc.stop(ctx.currentTime + 0.4);
    }, [getCtx]);

    const playCountdown = useCallback(() => {
        const ctx = getCtx();
        const now = ctx.currentTime;
        [440, 440, 440, 880].forEach((freq, i) => {
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.connect(gain).connect(ctx.destination);
            osc.type = 'square';
            osc.frequency.value = freq;
            const t = now + i * 0.8;
            gain.gain.setValueAtTime(i === 3 ? 0.08 : 0.04, t);
            gain.gain.exponentialRampToValueAtTime(0.001, t + 0.15);
            osc.start(t); osc.stop(t + 0.15);
        });
    }, [getCtx]);

    const playDrumroll = useCallback(() => {
        const ctx = getCtx();
        const now = ctx.currentTime;
        for (let i = 0; i < 20; i++) {
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.connect(gain).connect(ctx.destination);
            osc.type = 'triangle';
            osc.frequency.value = 80 + Math.random() * 40;
            const t = now + i * 0.04;
            const vol = 0.02 + (i / 20) * 0.06;
            gain.gain.setValueAtTime(vol, t);
            gain.gain.exponentialRampToValueAtTime(0.001, t + 0.05);
            osc.start(t); osc.stop(t + 0.05);
        }
    }, [getCtx]);

    // ── BGM ENGINE ───────────────────────────────────
    const startBGM = useCallback((mode: 'LOBBY' | 'GAME' | 'RESULTS') => {
        const ctx = getCtx();
        let stopped = false;

        // Master gain with fade-in
        const master = ctx.createGain();
        master.gain.setValueAtTime(0, ctx.currentTime);
        master.gain.linearRampToValueAtTime(bgmVolumeRef.current, ctx.currentTime + 1.0);

        // Compressor for punchiness
        const compressor = ctx.createDynamicsCompressor();
        compressor.threshold.setValueAtTime(-20, ctx.currentTime);
        compressor.knee.setValueAtTime(10, ctx.currentTime);
        compressor.ratio.setValueAtTime(4, ctx.currentTime);
        compressor.attack.setValueAtTime(0.003, ctx.currentTime);
        compressor.release.setValueAtTime(0.15, ctx.currentTime);
        master.connect(compressor).connect(ctx.destination);

        const chords = mode === 'LOBBY' ? LOBBY_CHORDS : mode === 'GAME' ? GAME_CHORDS : RESULTS_CHORDS;
        const bpm = mode === 'LOBBY' ? 85 : mode === 'GAME' ? 140 : 100;
        const stepDuration = 60 / bpm;

        const playNote = (freq: number, time: number, dur: number, type: OscillatorType = 'sine', vol = 0.15) => {
            if (stopped) return;
            const osc = ctx.createOscillator();
            const g = ctx.createGain();
            osc.connect(g).connect(master);
            osc.type = type;
            osc.frequency.setValueAtTime(freq, time);
            g.gain.setValueAtTime(vol, time);
            g.gain.exponentialRampToValueAtTime(0.001, time + dur * 0.95);
            osc.start(time);
            osc.stop(time + dur);
        };

        // Pad layer - lush detuned chords
        const playPadChord = (chordNotes: string[], startTime: number, dur: number) => {
            chordNotes.forEach(note => {
                const freq = NOTE_FREQS[note];
                if (!freq) return;
                playNote(freq, startTime, dur, 'sine', mode === 'GAME' ? 0.04 : 0.06);
                playNote(freq * 1.005, startTime, dur, 'sine', 0.02);
                if (mode === 'GAME') {
                    playNote(freq * 0.997, startTime, dur, 'sawtooth', 0.015);
                }
            });
        };

        // Bass layer — sub + mid
        const playBass = (freq: number, time: number, dur: number) => {
            if (stopped) return;
            // Sub bass
            playNote(freq, time, dur, 'sine', mode === 'GAME' ? 0.18 : 0.10);
            // Mid bass with grit
            if (mode === 'GAME') {
                playNote(freq * 2, time, dur * 0.6, 'sawtooth', 0.06);
            }
        };

        // Hi-hat (noise burst) — tighter and punchier
        const playHat = (time: number, open = false) => {
            if (stopped) return;
            const bufferSize = ctx.sampleRate * (open ? 0.12 : 0.02);
            const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
            const data = buffer.getChannelData(0);
            for (let i = 0; i < bufferSize; i++) data[i] = Math.random() * 2 - 1;
            const src = ctx.createBufferSource();
            src.buffer = buffer;
            const g = ctx.createGain();
            const hpf = ctx.createBiquadFilter();
            hpf.type = 'highpass';
            hpf.frequency.value = mode === 'GAME' ? 9000 : 8000;
            src.connect(hpf).connect(g).connect(master);
            g.gain.setValueAtTime(open ? 0.03 : 0.02, time);
            g.gain.exponentialRampToValueAtTime(0.001, time + (open ? 0.12 : 0.02));
            src.start(time);
        };

        // Kick — punchy 808-style
        const playKick = (time: number) => {
            if (stopped) return;
            const osc = ctx.createOscillator();
            const g = ctx.createGain();
            osc.connect(g).connect(master);
            osc.frequency.setValueAtTime(mode === 'GAME' ? 180 : 150, time);
            osc.frequency.exponentialRampToValueAtTime(25, time + 0.15);
            g.gain.setValueAtTime(mode === 'GAME' ? 0.30 : 0.20, time);
            g.gain.exponentialRampToValueAtTime(0.001, time + 0.18);
            osc.start(time); osc.stop(time + 0.18);
        };

        // Snare
        const playSnare = (time: number) => {
            if (stopped) return;
            // Noise body
            const bufSize = ctx.sampleRate * 0.08;
            const buf = ctx.createBuffer(1, bufSize, ctx.sampleRate);
            const d = buf.getChannelData(0);
            for (let i = 0; i < bufSize; i++) d[i] = Math.random() * 2 - 1;
            const src = ctx.createBufferSource();
            src.buffer = buf;
            const g = ctx.createGain();
            const bpf = ctx.createBiquadFilter();
            bpf.type = 'bandpass';
            bpf.frequency.value = 3000;
            src.connect(bpf).connect(g).connect(master);
            g.gain.setValueAtTime(0.06, time);
            g.gain.exponentialRampToValueAtTime(0.001, time + 0.08);
            src.start(time);
            // Tonal body
            playNote(200, time, 0.04, 'triangle', 0.08);
        };

        // Arpeggiator — energetic synth lead for GAME mode
        const playArp = (chordNotes: string[], startTime: number) => {
            if (mode !== 'GAME') return;
            const arpNotes = [...chordNotes, ...chordNotes.slice().reverse()];
            const arpStep = stepDuration / 4;
            arpNotes.forEach((note, i) => {
                const freq = NOTE_FREQS[note];
                if (!freq || i >= 8) return;
                playNote(freq * 2, startTime + i * arpStep, arpStep * 0.8, 'square', 0.02);
            });
        };

        let chordIdx = 0;

        const scheduleBar = () => {
            if (stopped) return;
            const now = ctx.currentTime + 0.05;
            const chord = chords[chordIdx % chords.length];
            const barLen = stepDuration * 4;
            const bassFreq = NOTE_FREQS[chord[0]] || 130;

            // Pad chord sustained across bar
            playPadChord(chord, now, barLen * 0.95);

            if (mode === 'LOBBY') {
                // Chill lo-fi: kick on 1 & 3, snare on 2 & 4, gentle hats
                playKick(now);
                playSnare(now + stepDuration);
                playKick(now + stepDuration * 2);
                playSnare(now + stepDuration * 3);
                for (let i = 0; i < 8; i++) {
                    playHat(now + i * stepDuration * 0.5, i % 4 === 2);
                }
                playBass(bassFreq, now, stepDuration * 2);
                playBass(bassFreq * 1.5, now + stepDuration * 2, stepDuration * 2);
            } else if (mode === 'GAME') {
                // HIGH ENERGY EDM: four-on-floor kicks, off-beat snares, 16th hats, arps
                for (let i = 0; i < 4; i++) {
                    playKick(now + i * stepDuration);
                    if (i === 1 || i === 3) playSnare(now + i * stepDuration);
                }
                // 16th note hi-hats for maximum energy
                for (let i = 0; i < 16; i++) {
                    playHat(now + i * stepDuration * 0.25, i % 4 === 2);
                }
                // Driving bassline pattern
                playBass(bassFreq, now, stepDuration * 0.7);
                playBass(bassFreq, now + stepDuration, stepDuration * 0.3);
                playBass(bassFreq * 1.5, now + stepDuration * 1.5, stepDuration * 0.3);
                playBass(bassFreq * 2, now + stepDuration * 2, stepDuration * 0.7);
                playBass(bassFreq, now + stepDuration * 3, stepDuration * 0.3);
                playBass(bassFreq * 1.5, now + stepDuration * 3.5, stepDuration * 0.3);
                // Arpeggiator on alternating bars
                if (chordIdx % 2 === 0) playArp(chord, now);
            } else {
                // Results: triumphant with arpeggiated celebration
                playKick(now);
                playSnare(now + stepDuration);
                playKick(now + stepDuration * 2);
                playSnare(now + stepDuration * 3);
                // Ascending arpeggio celebration
                chord.forEach((note, i) => {
                    const freq = NOTE_FREQS[note];
                    if (freq) {
                        playNote(freq, now + i * stepDuration * 0.4, stepDuration, 'sine', 0.07);
                        playNote(freq * 2, now + i * stepDuration * 0.4 + 0.05, stepDuration * 0.5, 'triangle', 0.03);
                    }
                });
                playBass(bassFreq, now, barLen);
            }

            chordIdx++;
        };

        // Schedule first bar immediately
        scheduleBar();
        const interval = setInterval(scheduleBar, stepDuration * 4 * 1000);

        bgmCleanupRef.current = () => {
            stopped = true;
            clearInterval(interval);
            master.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.5);
            setTimeout(() => { try { master.disconnect(); } catch(_e) { /* noop */ } }, 600);
        };
    }, [getCtx]);

    const setBGMHandler = useCallback((mode: 'LOBBY' | 'GAME' | 'RESULTS' | 'NONE') => {
        if (mode === currentBGM) return;
        setCurrentBGM(mode);

        // Cleanup previous
        if (bgmCleanupRef.current) {
            bgmCleanupRef.current();
            bgmCleanupRef.current = null;
        }

        if (mode !== 'NONE') {
            startBGM(mode);
        }
    }, [currentBGM, startBGM]);

    const setBgmVolumeHandler = useCallback((vol: number) => {
        bgmVolumeRef.current = vol;
        setBgmVolume(vol);
    }, []);

    const value = useMemo(() => ({
        playHover, playClick, playSuccess, playError, playBuzz, playPing,
        playCountdown, playDrumroll,
        setBGM: setBGMHandler,
        bgmVolume,
        setBgmVolume: setBgmVolumeHandler
    }), [playHover, playClick, playSuccess, playError, playBuzz, playPing, playCountdown, playDrumroll, setBGMHandler, bgmVolume, setBgmVolumeHandler]);

    return (
        <SoundContext.Provider value={value}>
            {children}
        </SoundContext.Provider>
    );
};