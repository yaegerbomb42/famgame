import { GameState } from '../types';
import { BaseGame } from './logic/BaseGame';
import { AIGenerator } from '../utils/AIGenerator';

export class OddOneOutGame extends BaseGame {
    id = 'ODD_ONE_OUT' as const;
    name = 'Odd One Out';
    description = 'Find the item that does not belong in the group.';

    private questions: any[] = [];

    protected async initGameData(gameState: GameState, broadcast: () => void, roast: (c?: string, t?: string) => void): Promise<void> {
        this.questions = await AIGenerator.generateOddOneOut(5);
        this.maxRounds = this.questions.length;

        gameState.gameData = {
            ...gameState.gameData,
            questionIndex: 0,
            question: this.questions.length > 0 ? this.questions[0] : null,
            submissions: {},
            roundResults: {}
        };
        
        if (this.questions.length === 0) {
            console.error('OddOneOut: NO QUESTIONS GENERATED. Abandoning game.');
            this.onEnd(gameState, broadcast, roast);
        }
    }

    protected async onTimerEnd(gameState: GameState, broadcast: () => void, roast: (context?: string, targetId?: string) => void): Promise<void> {
        if (this.phase === 'INTRO') {
            this.transitionTo(gameState, 'PLAYING', 20);
        } else if (this.phase === 'PLAYING') {
            this.resolveScores(gameState);
            this.transitionTo(gameState, 'REVEAL', 10);
        } else if (this.phase === 'REVEAL') {
            if (gameState.gameData.questionIndex < this.questions.length - 1) {
                gameState.gameData.questionIndex++;
                gameState.gameData.question = this.questions[gameState.gameData.questionIndex];
                gameState.gameData.submissions = {};
                this.transitionTo(gameState, 'INTRO', 8);
            } else {
                this.onEnd(gameState, broadcast, roast);
            }
        }
        broadcast();
    }

    protected async handlePlayerInput(gameState: GameState, playerId: string, data: any, broadcast: () => void, roast: (c?: string, t?: string) => void): Promise<void> {
        if (this.phase === 'PLAYING') {
            if (data.answerIndex !== undefined && gameState.gameData.submissions[playerId] === undefined) {
                // Record submission with timestamp for speed bonus
                gameState.gameData.submissions[playerId] = {
                    answerIndex: data.answerIndex,
                    time: Date.now()
                };

                // Auto-advance if all players have submitted
                if (Object.keys(gameState.gameData.submissions).length >= this.getActivePlayerCount(gameState)) {
                    await this.onTimerEnd(gameState, broadcast, roast);
                }
            }
        }
    }

    private resolveScores(gameState: GameState) {
        const qIdx = gameState.gameData.questionIndex;
        const currentQ = this.questions[qIdx];
        const correctIdx = currentQ.correct;

        const submissions = gameState.gameData.submissions;
        const playerIds = this.getNonHostPlayerIds(gameState);

        playerIds.forEach(pid => {
            const sub = submissions[pid];
            if (sub && sub.answerIndex === correctIdx) {
                // Base 500 points + speed bonus (up to 500)
                const elapsed = sub.time - this.phaseStartTime;
                const speedBonus = Math.max(0, 500 - Math.floor(elapsed / 40)); 
                this.awardPoints(gameState, pid, 500 + speedBonus);
            } else {
                this.awardPoints(gameState, pid, 0);
            }
        });
    }
}
