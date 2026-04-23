import { GameState } from '../types';
import { BaseGame } from './logic/BaseGame';

export class ReactionGame extends BaseGame {
    id = 'REACTION' as const;
    name = 'Lightning React';
    description = 'Wait for the green and tap as fast as you can!';

    protected async initGameData(gameState: GameState): Promise<void> {
        gameState.gameData = {
            ...gameState.gameData,
            submissions: {}, // pid -> time
            active: false,
            ready: false,
            round: 1,
            roundResults: {}
        };
        this.transitionTo(gameState, 'INTRO', 8);
    }

    protected async onTimerEnd(gameState: GameState, broadcast: () => void, roast: (c?: string, t?: string) => void): Promise<void> {
        if (this.phase === 'INTRO') {
            // First phase: 6 second counter (red screen)
            this.transitionTo(gameState, 'PLAYING', 6);
            gameState.gameData.ready = false;
            gameState.gameData.active = false;
        } else if (this.phase === 'PLAYING') {
            if (!gameState.gameData.ready) {
                // Counter finished, now random delay 1-3s
                gameState.gameData.ready = true;
                const randomDelay = Math.floor(Math.random() * 2000) + 1000;
                this.timer = randomDelay / 1000;
                gameState.gameData.timer = this.timer;
                
                broadcast();
                
                // We use a timeout for more precision than the 1s tick
                setTimeout(async () => {
                    gameState.gameData.active = true;
                    gameState.gameData.startTime = Date.now();
                    gameState.gameData.timer = 3; // 3s to react
                    this.timer = 3;
                    broadcast();
                    
                    // Final timeout if nobody reacts
                    setTimeout(async () => {
                        if (this.phase === 'PLAYING' && gameState.gameData.active) {
                            this.resolveScores(gameState);
                            this.transitionTo(gameState, 'REVEAL', 6);
                            broadcast();
                        }
                    }, 3000);
                }, randomDelay);
            }
        } else if (this.phase === 'REVEAL') {
            this.onEnd(gameState, broadcast, roast);
        }
        broadcast();
    }

    protected async handlePlayerInput(gameState: GameState, playerId: string, data: any, broadcast: () => void, roast: (c?: string, t?: string) => void): Promise<void> {
        if (this.phase === 'PLAYING') {
            if (data.action === 'tap') {
                if (gameState.gameData.active && !gameState.gameData.submissions[playerId]) {
                    const reactTime = Date.now() - gameState.gameData.startTime;
                    gameState.gameData.submissions[playerId] = reactTime;
                    
                    const nonHostCount = this.getActivePlayerCount(gameState);
                    if (Object.keys(gameState.gameData.submissions).length >= nonHostCount) {
                         this.resolveScores(gameState);
                         this.transitionTo(gameState, 'REVEAL', 6);
                    }
                    broadcast();
                } else if (!gameState.gameData.active) {
                    // False start
                    gameState.gameData.submissions[playerId] = -1;
                    roast('Too eager!', playerId);
                    broadcast();
                }
            }
        }
    }

    private resolveScores(gameState: GameState) {
        Object.entries(gameState.gameData.submissions).forEach(([pid, time]: [string, any]) => {
            if (time > 0) {
                const points = Math.max(0, 1000 - time);
                this.awardPoints(gameState, pid, Math.floor(points));
            } else if (time === -1) {
                this.awardPoints(gameState, pid, -200); // Heavy penalty for false start
            }
        });
    }
}

