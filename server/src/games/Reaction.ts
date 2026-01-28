import { GameState, IGameLogic } from '../types';

export class ReactionGame implements IGameLogic {
    id = 'REACTION' as const;
    name = 'Reaction';
    description = 'Wait for Green!';

    onStart(gameState: GameState, broadcast: () => void) {
        gameState.gameData = {
            phase: 'WAITING',
            goTime: 0,
            results: {},
            fakeOut: false
        };

        this.startSequence(gameState, broadcast);
    }

    startSequence(gameState: GameState, broadcast: () => void) {
        const isFakeOut = Math.random() < 0.3;

        if (isFakeOut) {
            setTimeout(() => {
                if (gameState.currentGame !== 'REACTION') return;

                gameState.gameData.fakeOut = true;
                broadcast();

                setTimeout(() => {
                    gameState.gameData.fakeOut = false;
                    broadcast();

                    setTimeout(() => {
                        if (gameState.currentGame === 'REACTION') {
                            this.triggerGo(gameState, broadcast);
                        }
                    }, Math.random() * 1000 + 500);

                }, 800);
            }, Math.random() * 2000 + 1000);
        } else {
            setTimeout(() => {
                if (gameState.currentGame === 'REACTION') {
                    this.triggerGo(gameState, broadcast);
                }
            }, Math.random() * 3000 + 2000);
        }
    }

    triggerGo(gameState: GameState, broadcast: () => void) {
        gameState.gameData.phase = 'GO';
        gameState.gameData.goTime = Date.now();
        broadcast();
    }

    onInput(gameState: GameState, playerId: string, data: any) {
        // Data: { action: 'click' }
        if (gameState.gameData.phase === 'WAITING') {
            // False Start
            if (gameState.players[playerId]) gameState.players[playerId].score -= 10;
        } else if (gameState.gameData.phase === 'GO') {
            if (!gameState.gameData.results[playerId]) {
                const diff = Date.now() - gameState.gameData.goTime;
                gameState.gameData.results[playerId] = diff;

                // Scoring
                if (diff < 300) {
                    if (gameState.players[playerId]) gameState.players[playerId].score += 100;
                } else if (diff < 500) {
                    if (gameState.players[playerId]) gameState.players[playerId].score += 50;
                } else {
                    if (gameState.players[playerId]) gameState.players[playerId].score += 10;
                }
            }
        }
    }

    onEnd(gameState: GameState) { }
}
