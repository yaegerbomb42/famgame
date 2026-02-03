import { create } from 'zustand';

interface VoiceStore {
    activeSpeakers: Record<string, boolean>; // userId -> isSpeaking
    setSpeaking: (userId: string, isSpeaking: boolean) => void;
}

export const useVoiceStore = create<VoiceStore>((set) => ({
    activeSpeakers: {},
    setSpeaking: (userId, isSpeaking) => set((state) => ({
        activeSpeakers: { ...state.activeSpeakers, [userId]: isSpeaking }
    })),
}));
