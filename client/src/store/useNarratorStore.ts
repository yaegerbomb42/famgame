import { create } from 'zustand';

// ═══════════════════════════════════════════════════
// 🎙️ THE FAM HOST - Savage, witty, and unhinged narrator
// Think: if a game show host had no filter and loved chaos
// ═══════════════════════════════════════════════════

// ── QUIP BANKS ──────────────────────────────────────
export const PLAYER_JOIN_QUIPS = [
    (name: string) => `Oh HELL yes, ${name} just walked in like they own the place!`,
    (name: string) => `${name} has entered the chat. Everybody act normal... too late.`,
    (name: string) => `Ladies and gentlemen, the legendary ${name}! ...never heard of 'em.`,
    (name: string) => `${name} just joined. Bold move. Let's see if it pays off.`,
    (name: string) => `${name}?? That's the name you went with? Okay, I respect the confidence.`,
    (name: string) => `Welcome ${name}! May your answers be less tragic than your username.`,
    (name: string) => `${name} is here to party! Or get absolutely destroyed. Same thing honestly.`,
    (name: string) => `A wild ${name} appears! Their special attack is... disappointment, probably.`,
    (name: string) => `${name} just slid into the game like a DM nobody asked for.`,
    (name: string) => `Everyone welcome ${name}! They look like they peaked in middle school.`,
    (name: string) => `${name} joined! I give them three rounds before they ragequit.`,
    (name: string) => `Oooh ${name} is in the building! The bar just got... well, it's a bar.`,
];

export const WRONG_ANSWER_QUIPS = [
    (name: string) => `${name}... buddy. Were you even trying?`,
    (name: string) => `${name} chose violence against their own score today.`,
    (name: string) => `And ${name} goes with the WRONG answer! Shocking absolutely nobody.`,
    (name: string) => `${name}, that answer was so bad I felt it in my circuits.`,
    (name: string) => `Oh ${name}... bless your heart.`,
    (name: string) => `${name} just speedran getting that wrong. World record pace!`,
    (name: string) => `${name}, I've seen better guesses from a coin flip.`,
    (name: string) => `Damn ${name}, did you just close your eyes and tap?`,
    (name: string) => `${name} said ✨wrong✨ with their whole chest. Respect.`,
    (name: string) => `${name}! That was... impressively incorrect. Like, you found a new dimension of wrong.`,
    (name: string) => `Maybe ${name} should sit the next one out. Or the next five.`,
    (name: string) => `${name}, even my random number generator would've done better.`,
];

export const CORRECT_ANSWER_QUIPS = [
    (name: string) => `Holy shit, ${name} actually got it right! Mark the calendar!`,
    (name: string) => `${name} coming in HOT with the correct answer! Big brain energy!`,
    (name: string) => `Okay okay ${name}, we see you! Not completely hopeless after all!`,
    (name: string) => `${name} nailed it! Even a broken clock is right twice a day though...`,
    (name: string) => `CORRECT! ${name} is actually built different. Or just lucky. We'll see.`,
    (name: string) => `${name} with the galaxy brain play! Somebody's been studying!`,
    (name: string) => `That's RIGHT, ${name}! Your parents would be so proud. Maybe.`,
    (name: string) => `${name} just proved they have at least one brain cell. More than I expected!`,
];

export const ROUND_START_QUIPS = [
    "Alright degenerates, new round! Try not to embarrass yourselves!",
    "Fresh round incoming! Time to separate the legends from the losers!",
    "Round starting! May the odds be ever in your favor... they won't be.",
    "Next round! Remember: there are no stupid answers. Just stupid players.",
    "Let's GO! New round, same chaos! I'm LIVING for this!",
    "Buckle up buttercups, this one's gonna be spicy!",
    "Another round! For some of you, that means another chance to disappoint me.",
    "Here we GO! Show me what you've got. No pressure. Okay, a LOT of pressure.",
];

export const GAME_START_QUIPS = [
    "GAME TIME! Oh this is gonna be beautiful. Or a total disaster. Either way, I'm entertained!",
    "The games have BEGUN! Let the chaos reign! I've got popcorn!",
    "IT'S GO TIME! Somebody's about to get their feelings hurt and I am HERE for it!",
    "Let's get this party STARTED! Everyone's a winner! ...Just kidding. There's only one.",
    "The arena is set! The players are questionable! LET'S GOOO!",
];

export const TIMEOUT_QUIPS = [
    (name: string) => `${name} ran out of time. Speed isn't their thing, clearly.`,
    (name: string) => `TIME'S UP, ${name}! Were you taking a nap??`,
    (name: string) => `${name} just watched the timer run out like it was a sporting event.`,
    (name: string) => `${name} timed out! The clock waits for no one, especially not you.`,
];

export const STREAK_QUIPS = [
    (name: string, streak: number) => `${name} is on a ${streak}-ANSWER STREAK! Somebody stop them!`,
    (name: string, streak: number) => `${streak} in a row for ${name}! They're either a genius or cheating. I'll allow it.`,
    (name: string, streak: number) => `${name} with ${streak} CONSECUTIVE correct answers! That's illegal!`,
];

export const LAST_PLACE_QUIPS = [
    (name: string) => `${name} is in last place but keeping the vibes positive! ...probably not actually.`,
    (name: string) => `Someone get ${name} a participation trophy. They need it.`,
    (name: string) => `${name} bringing up the rear! Somebody's gotta do it.`,
];

export const LEADER_QUIPS = [
    (name: string) => `${name} is DOMINATING! Crown them already!`,
    (name: string) => `${name} is in the lead! Target acquired, everybody else.`,
    (name: string) => `${name} sitting on top like they built this place!`,
];

export type NarratorMood = 'neutral' | 'hype' | 'savage' | 'sad';

// ── HELPER ──────────────────────────────────────────
const pickRandom = <T,>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)];

export const getJoinQuip = (name: string): { text: string, mood: NarratorMood } => ({ text: pickRandom(PLAYER_JOIN_QUIPS)(name), mood: 'hype' });
export const getWrongQuip = (name: string): { text: string, mood: NarratorMood } => ({ text: pickRandom(WRONG_ANSWER_QUIPS)(name), mood: 'savage' });
export const getCorrectQuip = (name: string): { text: string, mood: NarratorMood } => ({ text: pickRandom(CORRECT_ANSWER_QUIPS)(name), mood: 'hype' });
export const getRoundStartQuip = (): { text: string, mood: NarratorMood } => ({ text: pickRandom(ROUND_START_QUIPS), mood: 'hype' });
export const getGameStartQuip = (): { text: string, mood: NarratorMood } => ({ text: pickRandom(GAME_START_QUIPS), mood: 'hype' });
export const getTimeoutQuip = (name: string): { text: string, mood: NarratorMood } => ({ text: pickRandom(TIMEOUT_QUIPS)(name), mood: 'sad' });
export const getStreakQuip = (name: string, streak: number): { text: string, mood: NarratorMood } => ({ text: pickRandom(STREAK_QUIPS)(name, streak), mood: 'hype' });
export const getLastPlaceQuip = (name: string): { text: string, mood: NarratorMood } => ({ text: pickRandom(LAST_PLACE_QUIPS)(name), mood: 'savage' });
export const getLeaderQuip = (name: string): { text: string, mood: NarratorMood } => ({ text: pickRandom(LEADER_QUIPS)(name), mood: 'hype' });

// ── STORE ───────────────────────────────────────────
interface NarratorState {
    isPlaying: boolean;
    currentSubtitle: string;
    currentMood: NarratorMood;
    queue: { text: string; id: string; mood: NarratorMood }[];
    voice: SpeechSynthesisVoice | null;
    pitch: number;
    rate: number;
    customQuips: Array<{text: string, mood: NarratorMood}>;
    setCustomQuips: (quips: Array<{text: string, mood: NarratorMood}>) => void;
    speak: (text: string, mood?: NarratorMood) => void;
    stop: () => void;
    initVoice: () => void;
}

export const useNarratorStore = create<NarratorState>((set, get) => ({
    isPlaying: false,
    currentSubtitle: '',
    currentMood: 'neutral',
    queue: [],
    voice: null,
    pitch: 1.15,   // Slightly high = energetic showman
    rate: 1.08,    // Quick-witted pace
    customQuips: [],

    setCustomQuips: (quips) => set({ customQuips: quips }),

    initVoice: () => {
        const setVoice = () => {
            const voices = window.speechSynthesis.getVoices();
            // Priority: snarky British or deep American male
            let selectedVoice = 
                voices.find(v => v.name.includes('Daniel')) ||          // macOS British male
                voices.find(v => v.name.includes('Alex')) ||            // macOS American male
                voices.find(v => v.name.includes('Google UK English Male')) ||
                voices.find(v => v.name.includes('Aaron')) ||           // Edge
                voices.find(v => v.lang.startsWith('en-') && !v.name.includes('Female') && !v.name.includes('Samantha')) ||
                voices.find(v => v.lang.startsWith('en-'));

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

    speak: (text: string, mood: NarratorMood = 'neutral') => {
        const id = Math.random().toString(36).substring(7);

        set(state => ({
            queue: [...state.queue, { text, id, mood }]
        }));

        const processQueue = () => {
            const { queue, isPlaying, voice, pitch, rate } = get();
            if (isPlaying || queue.length === 0) return;

            const next = queue[0];
            const utterance = new SpeechSynthesisUtterance(next.text);

            if (voice) utterance.voice = voice;
            
            // Dynamic synthesis based on mood
            let moodPitch = pitch;
            let moodRate = rate;

            if (next.mood === 'hype') {
                moodPitch = 1.35;
                moodRate = 1.15;
            } else if (next.mood === 'savage') {
                moodPitch = 1.05; // Slightly lower/more serious
                moodRate = 1.25;  // Fast and aggressive
            } else if (next.mood === 'sad') {
                moodPitch = 0.8;
                moodRate = 0.85;
            }

            utterance.pitch = moodPitch;
            utterance.rate = moodRate;

            utterance.onstart = () => {
                set({ isPlaying: true, currentSubtitle: next.text, currentMood: next.mood });
            };

            utterance.onend = () => {
                set(state => ({
                    isPlaying: false,
                    currentSubtitle: '',
                    currentMood: 'neutral',
                    queue: state.queue.slice(1)
                }));
                setTimeout(processQueue, 200);
            };

            utterance.onerror = () => {
                set(state => ({
                    isPlaying: false,
                    currentSubtitle: '',
                    currentMood: 'neutral',
                    queue: state.queue.slice(1)
                }));
                setTimeout(processQueue, 200);
            };

            window.speechSynthesis.speak(utterance);
        };

        processQueue();
    },

    stop: () => {
        window.speechSynthesis.cancel();
        set({ isPlaying: false, currentSubtitle: '', currentMood: 'neutral', queue: [] });
    }
}));
