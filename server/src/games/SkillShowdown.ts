import { GameState, GameType } from '../types';
import { BaseGame } from './logic/BaseGame';

interface Challenge {
    type: 'CIRCLE_DRAW' | 'MEMORY_GRID' | 'PRECISION_TAP' | 'COLOR_MATCH' | 'ANGLE_GUESS';
    title: string;
    instruction: string;
    timeLimit: number;
    grid?: boolean[];
    targetColor?: { r: number; g: number; b: number };
    targetAngle?: number;
    targetBPM?: number;
}

const CHALLENGE_TEMPLATES: Challenge[] = [
    { type: 'CIRCLE_DRAW', title: 'Perfect Circle', instruction: 'Draw a circle as perfectly as you can!', timeLimit: 15 },
    { type: 'MEMORY_GRID', title: 'Neural Recall', instruction: 'Memorize the pattern, then recreate it.', timeLimit: 15 },
    { type: 'PRECISION_TAP', title: 'Precision Strike', instruction: 'Tap exactly when the marker hits the target!', timeLimit: 15 },
    { type: 'COLOR_MATCH', title: 'Chroma Sync', instruction: 'Mix the RGB sliders to match the target color.', timeLimit: 20 },
    { type: 'ANGLE_GUESS', title: 'Trajectory', instruction: 'Adjust the dial to the target angle.', timeLimit: 15 },
];

function buildChallenge(): Challenge {
    const base = { ...CHALLENGE_TEMPLATES[Math.floor(Math.random() * CHALLENGE_TEMPLATES.length)] };
    if (base.type === 'MEMORY_GRID') {
        return {
            ...base,
            grid: Array(16)
                .fill(false)
                .map(() => Math.random() > 0.7),
        };
    }
    if (base.type === 'COLOR_MATCH') {
        return {
            ...base,
            targetColor: {
                r: Math.floor(Math.random() * 256),
                g: Math.floor(Math.random() * 256),
                b: Math.floor(Math.random() * 256),
            },
        };
    }
    if (base.type === 'ANGLE_GUESS') {
        return { ...base, targetAngle: Math.floor(Math.random() * 360) };
    }
    if (base.type === 'PRECISION_TAP') {
        return { ...base, targetBPM: 85 }; // We will use targetBPM as the target zone for now to avoid interface changes, or just use a fixed value.
    }
    return { ...base };
}

export class SkillShowdownGame extends BaseGame {
    id = 'SKILL_SHOWDOWN' as GameType;
    name = 'Skill Showdown';
    description = 'Compete in mini-challenges of precision and speed!';

    private currentChallenge!: Challenge;

    protected async initGameData(gameState: GameState, broadcast: () => void, roast: (c?: string, t?: string) => void): Promise<void> {
        this.currentChallenge = buildChallenge();
        gameState.gameData = {
            ...gameState.gameData,
            challenge: this.currentChallenge,
            submissions: {},
            lastPeek: {}, // Track last known state for auto-submission
            scores: {},
            roundResults: {}
        };
        this.transitionTo(gameState, 'INTRO', 8);
    }

    protected async handlePlayerInput(gameState: GameState, playerId: string, data: any, broadcast: () => void, roast: (c?: string, t?: string) => void): Promise<void> {
        if (this.phase !== 'PLAYING') return;

        // If it's a peek (live state update), store it but don't finalize
        if (data.peek !== undefined) {
            gameState.gameData.lastPeek[playerId] = data.peek;
            return;
        }

        const score = this.calculateScore(data, this.currentChallenge);
        gameState.gameData.submissions[playerId] = score;
        broadcast();

        const humanCount = this.getActivePlayerCount(gameState);
        if (Object.keys(gameState.gameData.submissions).length >= humanCount) {
            this.timer = 0;
            await this.onTimerEnd(gameState, broadcast, roast);
        }
    }

    private calculateScore(data: any, c: Challenge): number {
        let score = 0;
        if (c.type === 'CIRCLE_DRAW' && data.circularity !== undefined) {
            score = data.circularity;
        } else if (c.type === 'MEMORY_GRID' && data.grid !== undefined) {
            let correct = 0;
            const target = c.grid!;
            for (let i = 0; i < 16; i++) if (data.grid[i] === target[i]) correct++;
            score = Math.round((correct / 16) * 100);
        } else if (c.type === 'PRECISION_TAP' && data.stopPoint !== undefined) {
            const target = 85; 
            const distance = Math.abs(data.stopPoint - target);
            if (distance <= 2.5) score = 100;
            else if (distance <= 5) score = 50;
            else if (distance <= 10) score = 25;
            else score = 0;
        } else if (c.type === 'COLOR_MATCH' && data.color !== undefined) {
            const t = c.targetColor!;
            const d = Math.abs(data.color.r - t.r) + Math.abs(data.color.g - t.g) + Math.abs(data.color.b - t.b);
            score = Math.max(0, Math.round(100 - (d / (255 * 3)) * 100));
        } else if (c.type === 'ANGLE_GUESS' && data.angle !== undefined) {
            const d = Math.abs(data.angle - (c.targetAngle || 0));
            score = Math.max(0, 100 - Math.min(d, 360 - d));
        }
        return score;
    }

    protected async onTimerEnd(gameState: GameState, broadcast: () => void, roast: (c?: string, t?: string) => void): Promise<void> {
        if (this.phase === 'INTRO') {
            const timeLimit = this.currentChallenge.type === 'COLOR_MATCH' ? 25 : 20;
            this.transitionTo(gameState, 'PLAYING', timeLimit);
        } else if (this.phase === 'PLAYING') {
            // Auto-submit from peeks for players who haven't submitted
            this.getNonHostPlayerIds(gameState).forEach(pid => {
                if (gameState.gameData.submissions[pid] === undefined) {
                    const lastData = gameState.gameData.lastPeek[pid];
                    if (lastData) {
                        gameState.gameData.submissions[pid] = this.calculateScore(lastData, this.currentChallenge);
                    } else {
                        gameState.gameData.submissions[pid] = 0;
                    }
                }
            });

            this.calculateResults(gameState);
            this.transitionTo(gameState, 'REVEAL', 10);
        } else if (this.phase === 'REVEAL') {
            this.onEnd(gameState, broadcast, roast);
        }
        broadcast();
    }

    private calculateResults(gameState: GameState) {
        Object.entries(gameState.gameData.submissions).forEach(([pid, score]: [string, any]) => {
            const points = Math.round(score * 10);
            this.awardPoints(gameState, pid, points);
        });
    }
}
