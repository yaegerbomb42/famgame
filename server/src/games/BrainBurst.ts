import { GameState } from '../types';
import { BaseGame } from './logic/BaseGame';
import { AIGenerator } from '../utils/AIGenerator';
import fs from 'fs';
import path from 'path';

const QUESTIONS_FILE = path.join(process.cwd(), 'data', 'trivia_questions.json');

const TIERS = [
    { level: 1, prize: '$100', points: 100 },
    { level: 2, prize: '$200', points: 200 },
    { level: 3, prize: '$300', points: 300 },
    { level: 4, prize: '$500', points: 500 },
    { level: 5, prize: '$1,000', points: 1000 },
    { level: 6, prize: '$2,000', points: 2000 },
    { level: 7, prize: '$4,000', points: 4000 },
    { level: 8, prize: '$8,000', points: 8000 },
    { level: 9, prize: '$16,000', points: 16000 },
    { level: 10, prize: '$32,000', points: 32000 },
    { level: 11, prize: '$64,000', points: 64000 },
    { level: 12, prize: '$125,000', points: 125000 },
    { level: 13, prize: '$250,000', points: 250000 },
    { level: 14, prize: '$500,000', points: 500000 },
    { level: 15, prize: '$1,000,000', points: 1000000 },
];

export class BrainBurstGame extends BaseGame {
    id = 'BRAIN_BURST' as const;
    name = 'Brain Burst';
    description = 'The ultimate high-stakes trivia challenge.';

    private questions: any[] = [];

    protected async initGameData(gameState: GameState, broadcast: () => void, roast: (c?: string, t?: string) => void): Promise<void> {
        try {
            if (fs.existsSync(QUESTIONS_FILE)) {
                const all = JSON.parse(fs.readFileSync(QUESTIONS_FILE, 'utf8'));
                this.questions = all.sort(() => Math.random() - 0.5).slice(0, 15);
            } else {
                console.log('BrainBurst: Questions file missing, generating with AI...');
                this.questions = await AIGenerator.generateTrivia('General', 15);
            }
        } catch (e) {
            console.error('BrainBurst: Error loading questions, falling back to AI.', e);
            this.questions = await AIGenerator.generateTrivia('General', 15);
        }

        gameState.gameData = {
            ...gameState.gameData,
            questionIndex: 0,
            question: this.questions.length > 0 ? this.questions[0] : null,
            tier: TIERS[0],
            tiers: TIERS,
            submissions: {},
            streaks: {},
            roundResults: {}
        };
        
        if (this.questions.length === 0) {
            console.error('BrainBurst: NO QUESTIONS GENERATED. Abandoning game.');
            this.onEnd(gameState, broadcast, roast);
            return;
        }

        this.transitionTo(gameState, 'INTRO', 8);
    }

    protected async onTimerEnd(gameState: GameState, broadcast: () => void, roast: (c?: string, t?: string) => void): Promise<void> {
        if (this.phase === 'INTRO') {
            this.transitionTo(gameState, 'PLAYING', 30);
        } else if (this.phase === 'PLAYING') {
            this.resolveScores(gameState);
            this.transitionTo(gameState, 'REVEAL', 8);
        } else if (this.phase === 'REVEAL') {
            if (gameState.gameData.questionIndex < this.questions.length - 1) {
                gameState.gameData.questionIndex++;
                gameState.gameData.question = this.questions[gameState.gameData.questionIndex];
                gameState.gameData.tier = TIERS[gameState.gameData.questionIndex];
                gameState.gameData.submissions = {};
                this.transitionTo(gameState, 'INTRO', 5);
            } else {
                this.onEnd(gameState, broadcast, roast);
            }
        }
        broadcast();
    }

    protected async handlePlayerInput(gameState: GameState, playerId: string, data: any, broadcast: () => void, roast: (c?: string, t?: string) => void): Promise<void> {
        if (this.phase === 'PLAYING') {
            if (data.answerIndex !== undefined) {
                gameState.gameData.submissions[playerId] = data.answerIndex;
                if (Object.keys(gameState.gameData.submissions).length >= this.getActivePlayerCount(gameState)) {
                    await this.onTimerEnd(gameState, broadcast, roast);
                }
            }
        }
    }

    private resolveScores(gameState: GameState) {
        const qIdx = gameState.gameData.questionIndex;
        const currentQ = this.questions[qIdx];
        const tier = TIERS[qIdx];

        const correctIdx = currentQ.correctIndex ?? currentQ.correct;
        this.getNonHostPlayerIds(gameState).forEach(pid => {
            const ans = gameState.gameData.submissions[pid];
            if (ans === correctIdx) {
                this.awardPoints(gameState, pid, tier.points);
                gameState.gameData.streaks[pid] = (gameState.gameData.streaks[pid] || 0) + 1;
            } else {
                gameState.gameData.streaks[pid] = 0;
            }
        });
    }
}
