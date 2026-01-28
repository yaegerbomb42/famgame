import { GameState, IGameLogic } from '../types';

export class HotTakesGame implements IGameLogic {
    id = 'HOT_TAKES' as const;
    name = 'Hot Takes';
    description = 'What is your spicy opinion?';

    onStart(gameState: GameState, broadcast: () => void) {
        gameState.gameData = {
            phase: 'INPUT',
            prompt: "What is the worst pizza topping?", // We can randomize this later
            inputs: {},
            votes: {},
            timer: 45
        };
    }

    onInput(gameState: GameState, playerId: string, data: any) {
        if (gameState.gameData.phase === 'INPUT') {
            // Data: { text: string }
            if (data.text) {
                gameState.gameData.inputs[playerId] = data.text;

                const playerCount = Object.keys(gameState.players).length;
                const inputCount = Object.keys(gameState.gameData.inputs).length;

                if (inputCount >= playerCount) {
                    gameState.gameData.phase = 'VOTING';
                }
            }
        } else if (gameState.gameData.phase === 'VOTING') {
            // Data: { targetId: string }
            if (data.targetId) {
                gameState.gameData.votes[playerId] = data.targetId;

                const playerCount = Object.keys(gameState.players).length;
                const voteCount = Object.keys(gameState.gameData.votes).length;

                if (voteCount >= playerCount) {
                    this.resolveRound(gameState);
                }
            }
        }
    }

    resolveRound(gameState: GameState) {
        gameState.gameData.phase = 'RESULTS';
        Object.values(gameState.gameData.votes).forEach((targetId: any) => {
            if (gameState.players[targetId]) gameState.players[targetId].score += 100;
        });
    }

    onEnd(gameState: GameState) {

    }
}
