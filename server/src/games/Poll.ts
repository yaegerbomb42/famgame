import { GameState } from '../types';
import { BaseGame } from './logic/BaseGame';
import { AIGenerator } from '../utils/AIGenerator';

export class PollGame extends BaseGame {
    id = 'POLL' as const;
    name = 'Poll Party';
    description = 'Guess the correct global statistic percentage! Closest wins.';
    protected introTime = 4;

    protected async initGameData(gameState: GameState): Promise<void> {
        gameState.gameData = {
            ...gameState.gameData,
            questions: [{ q: 'Counting global data...', correct: 50 }],
            currentRound: 0,
            totalRounds: 8,
            currentQuestion: 'Counting global data...',
            correct: 50,
            submissions: {}, // pid -> number guess
            roundResults: {}
        };

        // Fetch 8 unique rounds of content
        const questions = await AIGenerator.generateGlobalAverageQuestions(8);
        if (questions && questions.length > 0) {
            gameState.gameData.questions = questions;
            gameState.gameData.currentQuestion = questions[0].q;
            gameState.gameData.correct = questions[0].correct;
        }

        this.transitionTo(gameState, 'INTRO', 4);
    }

    public async update(dt: number, gameState: GameState, broadcast: () => void, roast: (c?: string, t?: string) => void): Promise<void> {
        await super.update(dt, gameState, broadcast, roast);

        if (this.phase === 'INTRO' && this.timer <= 0) {
            this.phase = 'PLAYING';
            this.timer = 14;
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
                this.timer = 5;
                this.resolveGuesses(gameState);
                broadcast();
            }
        }
    }

    protected async onTimerEnd(gameState: GameState, broadcast: () => void, roast: (c?: string, t?: string) => void): Promise<void> {
        if (this.phase === 'REVEAL') {
            this.transitionTo(gameState, 'RESULTS', 4);
        } else if (this.phase === 'RESULTS') {
            if (gameState.gameData.currentRound < gameState.gameData.totalRounds - 1) {
                gameState.gameData.currentRound++;
                const nextQ = gameState.gameData.questions[gameState.gameData.currentRound];
                gameState.gameData.currentQuestion = nextQ.q;
                gameState.gameData.correct = nextQ.correct;
                gameState.gameData.submissions = {}; // reset
                this.transitionTo(gameState, 'COUNTDOWN', 2);
            } else {
                this.onEnd(gameState, broadcast, roast);
            }
        }
        broadcast();
    }

    protected async handlePlayerInput(gameState: GameState, playerId: string, data: any, broadcast: () => void, roast: (c?: string, t?: string) => void): Promise<void> {
        if (this.phase === 'PLAYING') {
            // Assume data.guess is the percentage number
            if (typeof data.guess === 'number' && !gameState.gameData.submissions[playerId]) {
                gameState.gameData.submissions[playerId] = data.guess;
                if (Object.keys(gameState.gameData.submissions).length >= this.getActivePlayerCount(gameState)) {
                    this.timer = 0; // Trigger reveal immediately
                }
                broadcast(); // Show lock-in state to others
            }
        }
    }

    private resolveGuesses(gameState: GameState) {
        const correct = gameState.gameData.correct;
        const submissions = gameState.gameData.submissions as Record<string, number>;

        Object.entries(submissions).forEach(([pid, guess]) => {
            const diff = Math.abs(guess - correct);
            // Proximity scoring: 300 points for exact, down to 0 for being 30% away
            if (diff <= 30) {
                const points = Math.floor((30 - diff) * 10);
                this.awardPoints(gameState, pid, points);
            } else {
                this.awardPoints(gameState, pid, 10); // 10 points participation
            }
        });
    }
}
