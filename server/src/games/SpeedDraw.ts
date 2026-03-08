import { GameState, IGameLogic } from '../types';

const DRAW_PROMPTS = ['Cat', 'House', 'Car', 'Sun', 'Tree', 'Pizza', 'Robot', 'Ghost', 'Dragon', 'Rocket'];

export class SpeedDrawGame implements IGameLogic {
    id = 'SPEED_DRAW' as const;
    name = 'Speed Draw';
    description = 'Draw fast!';

    onStart(gameState: GameState, broadcast: () => void) {
        gameState.gameData = {
            phase: 'DRAWING',
            prompt: DRAW_PROMPTS[Math.floor(Math.random() * DRAW_PROMPTS.length)],
            drawings: {},
            votes: {},
            timer: 30,
        };

        // Timer logic
        // We'll use a simple external timer simulation for now or assume RoomManager/client handles countdown
        // But server should enforce phase change.
        setTimeout(() => {
            if (gameState.currentGame === 'SPEED_DRAW') {
                gameState.gameData.phase = 'VOTING';
                broadcast();
            }
        }, 30000);
    }

    onInput(gameState: GameState, playerId: string, data: any) {
        if (gameState.gameData.phase === 'DRAWING') {
            // data: { drawing: string (base64) }
            if (data.drawing) {
                gameState.gameData.drawings[playerId] = data.drawing;
            }
        } else if (gameState.gameData.phase === 'VOTING') {
            // data: { targetId: string }
            if (data.targetId) {
                gameState.gameData.votes[playerId] = data.targetId;
                // Tally logic omitted for brevity, similar to other voting games
            }
        }
    }

    onEnd(gameState: GameState) { }
}
