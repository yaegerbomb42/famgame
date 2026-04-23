import { GameState } from '../types';
import { BaseGame } from './logic/BaseGame';

import { AIGenerator } from '../utils/AIGenerator';

export class GlobalAveragesGame extends BaseGame {
    id = 'GLOBAL_AVERAGES' as const;
    name = 'Global Averages';
    description = 'Guess the percentage based on global data!';

    protected async initGameData(gameState: GameState, broadcast: () => void, roast: (c?: string, t?: string) => void): Promise<void> {
        gameState.gameData = {
            ...gameState.gameData,
            questions: [{ q: 'Counting global data...', correct: 50 }],
            currentRound: 0,
            totalRounds: 3,
            currentQuestion: 'Counting global data...',
            correct: 50,
            submissions: {},
            roundResults: {}
        };

        AIGenerator.generateGlobalAverageQuestions(3).then(res => {
            gameState.gameData.questions = res;
            gameState.gameData.currentQuestion = res[0].q;
            gameState.gameData.correct = res[0].correct;
        });

        this.transitionTo(gameState, 'INTRO', 5);
    }

    public async update(dt: number, gameState: GameState, broadcast: () => void, roast: (c?: string, t?: string) => void): Promise<void> {
        await super.update(dt, gameState, broadcast, roast);

        if (this.phase === 'INTRO' && this.timer <= 0) {
            this.phase = 'PLAYING';
            this.timer = 20;
            broadcast();
            return;
        }

        if (this.phase === 'PLAYING') {
            const activePlayers = Object.values(gameState.players).filter((p: any) => !p.isHost);
            const subCount = Object.keys(gameState.gameData.submissions).length;

            if (subCount >= activePlayers.length && activePlayers.length > 0) {
                // Snap transition
                this.timer = 0;
            }

            if (this.timer <= 0) {
                this.phase = 'REVEAL';
                this.timer = 8;
                this.resolveGuesses(gameState);
                broadcast();
            }
        }
    }

    protected async onTimerEnd(gameState: GameState, broadcast: () => void, roast: (c?: string, t?: string) => void): Promise<void> {
        if (this.phase === 'REVEAL') {
            this.transitionTo(gameState, 'RESULTS', 8);
        } else if (this.phase === 'RESULTS') {
            if (gameState.gameData.currentRound < gameState.gameData.totalRounds - 1) {
                gameState.gameData.currentRound++;
                const nextQ = gameState.gameData.questions[gameState.gameData.currentRound];
                gameState.gameData.currentQuestion = nextQ.q;
                gameState.gameData.correct = nextQ.correct;
                gameState.gameData.submissions = {}; // reset
                this.transitionTo(gameState, 'COUNTDOWN', 3);
            } else {
                this.onEnd(gameState, broadcast, roast);
            }
        }
        broadcast();
    }

    protected async handlePlayerInput(gameState: GameState, playerId: string, data: any, broadcast: () => void, roast: (c?: string, t?: string) => void): Promise<void> {
        if (this.phase === 'PLAYING') {
            if (typeof data.guess === 'number') {
                gameState.gameData.submissions[playerId] = data.guess;
                if (Object.keys(gameState.gameData.submissions).length >= this.getActivePlayerCount(gameState)) {
                    this.timer = 0; // Trigger reveal immediately on next tick (or now)
                    await this.onTimerEnd(gameState, broadcast, roast);
                }
                broadcast(); // Force immediate update to all players
            }
        }
    }

    private resolveGuesses(gameState: GameState) {
        const correct = gameState.gameData.correct;
        const submissions = gameState.gameData.submissions as Record<string, number>;

        Object.entries(submissions).forEach(([pid, guess]) => {
            const diff = Math.abs(guess - correct);
            // Proximity scoring: give points if within 30%, max 300 points
            if (diff <= 30) {
                const points = Math.floor((30 - diff) * 10); // 30 diff = 0 points, 0 diff = 300 points
                this.awardPoints(gameState, pid, points);
            } else {
                this.awardPoints(gameState, pid, 10); // 10 points for participating
            }
        });
    }
}
