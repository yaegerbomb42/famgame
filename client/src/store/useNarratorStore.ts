import { create, type StateCreator } from 'zustand';

interface NarratorState {
    isPlaying: boolean;
    currentSubtitle: string;
    queue: { text: string; id: string }[];
    voice: SpeechSynthesisVoice | null;
    pitch: number;
    rate: number;
    speak: (text: string) => void;
    stop: () => void;
    initVoice: () => void;
}

const narratorStore: StateCreator<NarratorState> = (set, get) => ({
    isPlaying: false,
    currentSubtitle: '',
    queue: [],
    voice: null,
    pitch: 0.8, // Slightly lower pitch for a cynical robot vibe
    rate: 1.1,  // Slightly faster for a snappy delivery

    initVoice: () => {
        const setVoice = () => {
            const voices = window.speechSynthesis.getVoices();
            // Try to find a good robotic/snarky voice. 
            // Varies by OS/Browser, but we'll prioritize English and specific ones if possible.
            let selectedVoice = voices.find(v => v.name.includes('Daniel') || v.name.includes('Google UK English Male'));

            // Fallback to any English male or just the first English voice
            if (!selectedVoice) {
                selectedVoice = voices.find(v => v.lang.startsWith('en-') && !v.name.includes('Female')) || voices.find(v => v.lang.startsWith('en-'));
            }

            if (selectedVoice) {
                set({ voice: selectedVoice });
            }
        };

        if (window.speechSynthesis.getVoices().length > 0) {
            setVoice();
        } else {
            window.speechSynthesis.onvoiceschanged = setVoice;
        }
    },

    speak: (text: string) => {
        const id = Math.random().toString(36).substring(7);

        set((state) => ({
            queue: [...state.queue, { text, id }]
        }));

        const processQueue = () => {
            const { queue, isPlaying, voice, pitch, rate } = get();
            if (isPlaying || queue.length === 0) return;

            const next = queue[0];
            const utterance = new SpeechSynthesisUtterance(next.text);

            if (voice) utterance.voice = voice;
            utterance.pitch = pitch;
            utterance.rate = rate;

            utterance.onstart = () => {
                set({ isPlaying: true, currentSubtitle: next.text });
            };

            utterance.onend = () => {
                set((state) => ({
                    isPlaying: false,
                    currentSubtitle: '',
                    queue: state.queue.slice(1)
                }));
                // Short delay before next line
                setTimeout(() => (get() as any).speak(''), 100); // Hack to trigger queue check
            };

            utterance.onerror = (e) => {
                console.error("Speech Synthesis Error:", e);
                set((state) => ({
                    isPlaying: false,
                    currentSubtitle: '',
                    queue: state.queue.slice(1)
                }));
            }

            window.speechSynthesis.speak(utterance);
        };

        // If 'speak' was called just to poke the queue (hack above)
        if (text === '') {
            set((state) => ({ queue: state.queue.filter((q: { text: string }) => q.text !== '') }));
            processQueue();
            return;
        }

        processQueue();
    },

    stop: () => {
        window.speechSynthesis.cancel();
        set({ isPlaying: false, currentSubtitle: '', queue: [] });
    }
});

export const useNarratorStore = create<NarratorState>(narratorStore);
