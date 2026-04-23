import { GameState } from '../types';
import { BaseGame } from './logic/BaseGame';

export class BuzzInGame extends BaseGame {
    id = 'BUZZ_IN' as const;
    name = 'Buzz In';
    description = 'Race against others to be the first to buzz in for the prompt.';

    protected async initGameData(gameState: GameState): Promise<void> {
        gameState.gameData = {
            ...gameState.gameData,
            winnerId: null,
            startTime: 0,
            active: false,
            roundResults: {}
        };
        this.transitionTo(gameState, 'INTRO', 5);
    }

    protected async onTimerEnd(gameState: GameState, broadcast: () => void, roast: (c?: string, t?: string) => void): Promise<void> {
        if (this.phase === 'INTRO') {
            const delay = Math.floor(Math.random() * 5) + 3; // 3-8s delay
            this.transitionTo(gameState, 'PLAYING', delay);
            gameState.gameData.active = false;
        } else if (this.phase === 'PLAYING') {
            if (!gameState.gameData.active) {
                // Time to buzz!
                gameState.gameData.active = true;
                gameState.gameData.startTime = Date.now();
                this.timer = 5; // Give them 5s to react
                gameState.gameData.timer = 5;
            } else {
                // Nobody buzzed in time
                this.transitionTo(gameState, 'REVEAL', 6);
            }
        } else if (this.phase === 'REVEAL') {
            this.onEnd(gameState, broadcast, roast);
        }
        broadcast();
    }

    protected async handlePlayerInput(gameState: GameState, playerId: string, data: any, broadcast: () => void, roast: (c?: string, t?: string) => void): Promise<void> {
        if (this.phase === 'PLAYING') {
            if (data.action === 'buzz') {
                if (gameState.gameData.active && !gameState.gameData.winnerId) {
                    gameState.gameData.winnerId = playerId;
                    gameState.gameData.reactionTime = Date.now() - gameState.gameData.startTime;
                    this.awardPoints(gameState, playerId, 500);
                    roast('Fast fingers', playerId);
                    await this.onTimerEnd(gameState, broadcast, roast);
                } else if (!gameState.gameData.active) {
                    // False start
                    this.awardPoints(gameState, playerId, -100);
                    roast('Too eager', playerId);
                }
            }
        }
    }
}
