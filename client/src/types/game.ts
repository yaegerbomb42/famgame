export type GameMode = 'LOBBY' | 'GAME_SELECT' | 'PLAYING' | 'TRIVIA' | 'REACTION' | 'BRAIN_BURST' | 'GLOBAL_AVERAGES' | 'SKILL_SHOWDOWN' | 'RESULTS';

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
    submissions: Record<string, any>; // Complex union types sometimes struggle with any in Record value
    scores: Record<string, number>;
}

export type AllGameData =
    | TriviaGameData
    | ReactionGameData
    | BrainBurstGameData
    | GlobalAveragesGameData
    | SkillShowdownGameData;
