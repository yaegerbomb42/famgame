import { GameState, IGameLogic } from '../types';

export class BuzzInGame implements IGameLogic {
    id = 'BUZZ_IN' as const;
    name = 'Buzz In';
    description = 'Fastest finger first!';

    onStart(gameState: GameState, broadcast: () => void) {
        this.startNewRound(gameState, broadcast);
    }

    startNewRound(gameState: GameState, broadcast: () => void) {
        gameState.gameData = {
            phase: 'WAITING',
            winnerId: null,
        };

        const delay = Math.random() * 2000 + 2000;
        setTimeout(() => {
            // Check if game is still active and phase is WAITING
            if (gameState.currentGame === 'BUZZ_IN' && gameState.gameData.phase === 'WAITING') {
                gameState.gameData.phase = 'ACTIVE';
                broadcast();
            }
        }, delay);
    }

    onInput(gameState: GameState, playerId: string, data: any) {
        if (data.action === 'buzz') {
            const player = gameState.players[playerId];
            if (player?.bannedUntil && player.bannedUntil > Date.now()) return;

            if (gameState.gameData.phase === 'WAITING') {
                // False start
                if (player) player.bannedUntil = Date.now() + 2000;
            } else if (gameState.gameData.phase === 'ACTIVE') {
                gameState.gameData.phase = 'BUZZED';
                gameState.gameData.winnerId = playerId;
                if (player) player.score += 50;
            }
        }
    }

    onEnd(gameState: GameState) { }
}
