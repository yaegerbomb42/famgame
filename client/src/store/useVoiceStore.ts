import { create, type StateCreator } from 'zustand';

interface VoiceStore {
    activeSpeakers: Record<string, boolean>; // userId -> isSpeaking
    setSpeaking: (userId: string, isSpeaking: boolean) => void;
}

const voiceStore: StateCreator<VoiceStore> = (set) => ({
    activeSpeakers: {},
    setSpeaking: (userId, isSpeaking) => set((state) => ({
        activeSpeakers: { ...state.activeSpeakers, [userId]: isSpeaking }
    })),
});

export const useVoiceStore = create<VoiceStore>(voiceStore);
