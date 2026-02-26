import { GameState, IGameLogic } from '../types';

export class ReactionGame implements IGameLogic {
    id = 'REACTION' as const;
    name = 'Lightning React';
    description = 'Tap when the screen turns GREEN!';

    onStart(gameState: GameState, broadcast: () => void) {
        // Initial state
        gameState.gameData = {
            phase: 'INSTRUCT',
            timer: 5, // 5 seconds of instruction
            round: 0,
            scores: {},
        };
        broadcast();
    }

    update(dt: number, gameState: GameState, broadcast: () => void) {
        if (gameState.gameData.phase === 'GAME_OVER') return;

        let stateChanged = false;

        if (gameState.gameData.phase === 'INSTRUCT' || gameState.gameData.phase === 'RESULT') {
            gameState.gameData.timer -= dt;
            if (gameState.gameData.timer <= 0) {
                if (gameState.gameData.round >= 5) {
                    gameState.gameData.phase = 'GAME_OVER';
                } else {
                    // Start next round
                    gameState.gameData.phase = 'WAITING';
                    gameState.gameData.round++;
                    gameState.gameData.delay = Math.random() * 3 + 2; // 2-5 seconds random delay
                    gameState.gameData.startTime = 0;
                    gameState.gameData.answers = {};
                }
                stateChanged = true;
            }
        } else if (gameState.gameData.phase === 'WAITING') {
            gameState.gameData.delay -= dt;
            if (gameState.gameData.delay <= 0) {
                gameState.gameData.phase = 'GO';
                gameState.gameData.startTime = Date.now();
                gameState.gameData.timer = 5; // 5 seconds max to react
                stateChanged = true;
            }
        } else if (gameState.gameData.phase === 'GO') {
            gameState.gameData.timer -= dt;
            if (gameState.gameData.timer <= 0) {
                this.resolveRound(gameState);
                stateChanged = true;
            }
        }

        if (stateChanged) broadcast();
    }

    onInput(gameState: GameState, playerId: string, data: any) {
        if (gameState.gameData.phase === 'WAITING') {
            // Early click! Penalize them
            if (!gameState.gameData.answers) gameState.gameData.answers = {};
            if (gameState.gameData.answers[playerId]) return;

            gameState.gameData.answers[playerId] = {
                time: -1000 // Flag for early click
            };

        } else if (gameState.gameData.phase === 'GO') {
            if (!gameState.gameData.answers) gameState.gameData.answers = {};
            if (gameState.gameData.answers[playerId]) return;

            const reactTime = Date.now() - gameState.gameData.startTime;
            gameState.gameData.answers[playerId] = {
                time: reactTime
            };

            const playerCount = Object.values(gameState.players).filter(p => !p.isHost).length;
            if (Object.keys(gameState.gameData.answers).length >= playerCount) {
                this.resolveRound(gameState);
            }
        }
    }

    private resolveRound(gameState: GameState) {
        if (gameState.gameData.phase === 'RESULT') return;

        gameState.gameData.phase = 'RESULT';
        gameState.gameData.timer = 4; // Show results for 4 seconds

        const answers = gameState.gameData.answers || {};
        const roundScores: Record<string, any> = {};

        Object.keys(gameState.players).forEach(pid => {
            const p = gameState.players[pid];
            if (p.isHost) return;

            const ans = answers[pid];
            if (!ans) {
                // Didn't click
                roundScores[pid] = { points: 0, time: null, early: false };
            } else if (ans.time < 0) {
                // Early click
                roundScores[pid] = { points: -50, time: null, early: true };
                p.score -= 50; // Minor penalty
            } else {
                // Proper click
                const points = Math.max(0, Math.floor(1000 - ans.time));
                roundScores[pid] = { points, time: ans.time, early: false };
                p.score += points;
            }
        });

        gameState.gameData.roundScores = roundScores;
    }

    onPlayerLeave(gameState: GameState, playerId: string, broadcast: () => void) {
        if (gameState.gameData.phase !== 'GO') return;

        const playerCount = Object.keys(gameState.players).filter(id => id !== playerId && !gameState.players[id].isHost).length;
        const activeAnswers = Object.keys(gameState.gameData.answers || {}).filter(id => id !== playerId).length;

        if (playerCount > 0 && activeAnswers >= playerCount) {
            this.resolveRound(gameState);
            broadcast();
        } else if (playerCount === 0) {
            gameState.gameData.phase = 'GAME_OVER';
            broadcast();
        }
    }

    onEnd(gameState: GameState) { }
}
