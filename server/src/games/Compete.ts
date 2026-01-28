import { GameState, IGameLogic } from '../types';

export class CompeteGame implements IGameLogic {
    id = 'COMPETE' as const;
    name = 'Compete';
    description = '1v1 Battle!';

    private broadcast: (() => void) | null = null;

    onStart(gameState: GameState, broadcast: () => void) {
        this.broadcast = broadcast;
        const playerIds = Object.keys(gameState.players);
        // Pick 2 random players
        const challengers = playerIds.sort(() => Math.random() - 0.5).slice(0, 2);

        const challenges = [
            { type: 'TAP', target: 30 },
            { type: 'TYPE', target: 'The quick brown fox' },
            // { type: 'SEQUENCE', target: { sequence: [1, 2, 3, 4, 5] } },
        ];

        gameState.gameData = {
            phase: 'COUNTDOWN',
            challenger1Id: challengers[0] || '',
            challenger2Id: challengers[1] || challengers[0] || '',
            challenge: challenges[Math.floor(Math.random() * challenges.length)],
            progress: {},
            timer: 3,
            winnerId: null
        };

        setTimeout(() => {
            if (gameState.currentGame === 'COMPETE') {
                gameState.gameData.phase = 'ACTIVE';
                if (this.broadcast) this.broadcast();
            }
        }, 3000);
    }

    onInput(gameState: GameState, playerId: string, data: any) {
        if (gameState.gameData.phase === 'ACTIVE') {
            // Check if player is a challenger
            if (playerId !== gameState.gameData.challenger1Id && playerId !== gameState.gameData.challenger2Id) return;

            // Logic depending on challenge type
            const type = gameState.gameData.challenge.type;

            if (type === 'TAP') {
                // data: { tap: true }
                if (!gameState.gameData.progress[playerId]) gameState.gameData.progress[playerId] = 0;
                gameState.gameData.progress[playerId]++;

                if (gameState.gameData.progress[playerId] >= gameState.gameData.challenge.target) {
                    this.resolveGame(gameState, playerId);
                }
            } else if (type === 'TYPE') {
                // data: { text: string }
                gameState.gameData.progress[playerId] = data.text;
                if (data.text === gameState.gameData.challenge.target) {
                    this.resolveGame(gameState, playerId);
                }
            }
        }
    }

    resolveGame(gameState: GameState, winnerId: string) {
        gameState.gameData.phase = 'RESULTS';
        gameState.gameData.winnerId = winnerId;
        if (gameState.players[winnerId]) gameState.players[winnerId].score += 200;
        if (this.broadcast) this.broadcast();
    }

    onEnd(gameState: GameState) { }
}
