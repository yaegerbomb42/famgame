export type GameMode =
    | 'LOBBY' | 'GAME_SELECT' | 'PLAYING' | 'RESULTS'
    | 'TRIVIA' | 'REACTION' | 'BRAIN_BURST' | 'GLOBAL_AVERAGES' | 'SKILL_SHOWDOWN'
    | 'ROAST_MASTER' | 'SPEED_DRAW' | 'THIS_OR_THAT' | 'TWO_TRUTHS' | 'WORD_RACE'
    | 'BLUFF' | 'BUZZ' | 'CHAIN_REACTION' | 'COMPETE' | 'EMOJI_STORY' | 'HOT_TAKES' | 'MIND_MELD' | 'POLL'
    | string; // Allow for future/unlisted modes

export interface ChatMessage {
    id: string;
    text: string;
    name: string;
    avatar?: string;
    isAi?: boolean;
    isSystem?: boolean;
    timestamp?: number;
}

export interface AiPersona {
    name: string;
    avatar: string;
}

export type SkillSubmitData =
    | { circularity: number }
    | { grid: boolean[] }
    | { consistency: number }
    | { color: { r: number; g: number; b: number } }
    | { angle: number };

export interface TriviaGameData {
    round: number;
    currentQuestion: {
        q: string;
        a: string[];
        correct: number;
        category?: string;
    } | null;
    category: string;
    difficulty: string;
    showResult: boolean;
    timer: number;
    roundScores: Record<string, {
        isCorrect: boolean;
        points: number;
        confidence: number;
        choice: number;
    }>;
    phase?: 'SETTINGS' | 'PLAYING';
}

export interface ReactionGameData {
    phase: 'INSTRUCT' | 'WAITING' | 'GO' | 'RESULT';
    timer: number;
    round: number;
    roundScores: Record<string, {
        time: number | null;
        early: boolean;
        points: number;
    }>;
}

export interface BrainBurstGameData {
    phase: 'INTRO' | 'QUESTION' | 'REVEAL' | 'CELEBRATION' | 'GAME_OVER';
    currentQuestion: {
        q: string;
        a: string[];
        correct: number;
    };
    tier: {
        level: number;
        prize: string;
        points: number;
    };
    questionIndex: number;
    fiftyFiftyDisabled: number[];
    lifelinesUsed: Record<string, boolean>;
    showResult: boolean;
    timer: number;
    answers: Record<string, number>;
    tiers: {
        level: number;
        prize: string;
        points: number;
    }[];
    streaks: Record<string, number>;
}

export interface GlobalAveragesGameData {
    phase: 'WAITING' | 'REVEAL';
    question: string;
    correct: number;
    guesses: Record<string, number>;
    timerEnd: number;
    submissionCount: number;
    totalPlayers: number;
    closestPid?: string;
    pointsAwarded?: number;
    timer?: number;
    showResult?: boolean;
}

export interface SkillShowdownGameData {
    phase: 'PREVIEW' | 'PLAYING' | 'REVEAL';
    challengeIndex: number;
    challenge: {
        type: string;
        title: string;
        instruction: string;
        timeLimit: number;
        grid?: boolean[];
        targetColor?: { r: number; g: number; b: number };
        targetAngle?: number;
        targetBPM?: number;
    };
    submissions: Record<string, SkillSubmitData>;
    scores: Record<string, number>;
}

export interface BaseGameData {
    phase?: string;
    timer?: number;
    round?: number;
    showResult?: boolean;
    [key: string]: any; // Catch-all for other games while we incrementally type them
}

export interface AllGameData {
    phase?: string;
    timer?: number;
    round?: number;
    showResult?: boolean;
    [key: string]: any;
}
