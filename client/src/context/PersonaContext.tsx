import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { PERSONA_SCRIPTS } from '../data/personaScripts';

interface PersonaContextType {
    speak: (key: keyof typeof PERSONA_SCRIPTS | string, forceLiteral?: boolean) => void;
    isSpeaking: boolean;
    cancel: () => void;
}

const PersonaContext = createContext<PersonaContextType | null>(null);

export const usePersona = () => {
    const context = useContext(PersonaContext);
    if (!context) throw new Error('usePersona must be used within a PersonaProvider');
    return context;
};

export const PersonaProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [isSpeaking, setIsSpeaking] = useState(false);
    const [voice, setVoice] = useState<SpeechSynthesisVoice | null>(null);

    useEffect(() => {
        const loadVoices = () => {
            const voices = window.speechSynthesis.getVoices();
            // Try to find a good English voice
            const preferredVoice = voices.find(v => v.name.includes('Google US English')) || 
                                   voices.find(v => v.name.includes('Samantha')) || // macOS default
                                   voices.find(v => v.lang === 'en-US') || 
                                   voices[0];
            setVoice(preferredVoice || null);
        };

        loadVoices();
        window.speechSynthesis.onvoiceschanged = loadVoices;
    }, []);

    const speak = useCallback((key: keyof typeof PERSONA_SCRIPTS | string, forceLiteral: boolean = false) => {
        if (!window.speechSynthesis) return;

        window.speechSynthesis.cancel(); // Stop current speech

        let text = key;
        if (!forceLiteral && key in PERSONA_SCRIPTS) {
            const scripts = PERSONA_SCRIPTS[key as keyof typeof PERSONA_SCRIPTS];
            text = scripts[Math.floor(Math.random() * scripts.length)];
        }

        const utterance = new SpeechSynthesisUtterance(text);
        if (voice) utterance.voice = voice;
        
        // Tweak properties for personality
        utterance.pitch = 1.1; // Slightly higher
        utterance.rate = 1.1;  // Slightly faster
        utterance.volume = 1.0;

        utterance.onstart = () => setIsSpeaking(true);
        utterance.onend = () => setIsSpeaking(false);
        utterance.onerror = () => setIsSpeaking(false);

        window.speechSynthesis.speak(utterance);
    }, [voice]);

    const cancel = useCallback(() => {
        if (window.speechSynthesis) {
            window.speechSynthesis.cancel();
            setIsSpeaking(false);
        }
    }, []);

    return (
        <PersonaContext.Provider value={{ speak, isSpeaking, cancel }}>
            {children}
        </PersonaContext.Provider>
    );
};
