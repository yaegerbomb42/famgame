import { GameState, IGameLogic } from '../types';

export class BluffGame implements IGameLogic {
    id = 'BLUFF' as const;
    name = 'Bluff';
    description = 'Are they lying?';

    onStart(gameState: GameState, broadcast: () => void) {
        const playerIds = Object.keys(gameState.players);
        gameState.gameData = {
            phase: 'CLAIM',
            currentClaimerId: playerIds[Math.floor(Math.random() * playerIds.length)],
            claim: null,
            isLying: null,
            votes: {},
        };
    }

    onInput(gameState: GameState, playerId: string, data: any) {
        if (gameState.gameData.phase === 'CLAIM') {
            if (playerId === gameState.gameData.currentClaimerId) {
                // data: { claim: string, isLying: boolean }
                if (data.claim) {
                    gameState.gameData.claim = data.claim;
                    gameState.gameData.isLying = data.isLying;
                    gameState.gameData.phase = 'VOTING';
                }
            }
        } else if (gameState.gameData.phase === 'VOTING') {
            // data: { vote: boolean } (true = truth, false = lie)
            if (typeof data.vote === 'boolean') {
                gameState.gameData.votes[playerId] = data.vote;

                const playerCount = Object.keys(gameState.players).length;
                // Exclude claimer from count
                const voterCount = playerCount - 1;
                const currentVotes = Object.keys(gameState.gameData.votes).length;

                if (currentVotes >= voterCount) {
                    this.resolveRound(gameState);
                }
            }
        }
    }

    resolveRound(gameState: GameState) {
        gameState.gameData.phase = 'RESULTS';
        const isLying = gameState.gameData.isLying;

        Object.entries(gameState.gameData.votes).forEach(([voterId, vote]: [string, any]) => {
            // Vote is "Is it Truth?"
            // If isLying is true, then Truth is FALSE.
            // If vote == !isLying, Correct.

            const correct = (vote === !isLying);
            if (correct) {
                if (gameState.players[voterId]) gameState.players[voterId].score += 50;
            } else {
                // Fooling people bonus
                const claimerId = gameState.gameData.currentClaimerId;
                if (gameState.players[claimerId]) gameState.players[claimerId].score += 25;
            }
        });
    }

    onEnd(gameState: GameState) { }
}
