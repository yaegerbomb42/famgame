import { GameState, IGameLogic } from '../types';

export class TwoTruthsGame implements IGameLogic {
    id = '2TRUTHS' as const;
    name = '2 Truths & 1 Lie';
    description = 'Spot the lie!';

    onStart(gameState: GameState, broadcast: () => void) {
        gameState.gameData = {
            phase: 'INPUT',
            inputs: {},
            currentSubjectId: null,
            votes: {},
            timer: 60,
            showLie: false
        };
    }

    onInput(gameState: GameState, playerId: string, data: any) {
        if (gameState.gameData.phase === 'INPUT') {
            // Data: { statements: string[], lieIndex: number }
            if (data.statements && typeof data.lieIndex === 'number') {
                gameState.gameData.inputs[playerId] = data;

                const playerCount = Object.keys(gameState.players).length;
                const inputCount = Object.keys(gameState.gameData.inputs).length;

                if (inputCount >= playerCount) {
                    this.startVotingPhase(gameState);
                }
            }
        } else if (gameState.gameData.phase === 'VOTING') {
            // Data: { voteIndex: number }
            if (typeof data.voteIndex === 'number') {
                if (playerId === gameState.gameData.currentSubjectId) return; // Can't vote for self

                gameState.gameData.votes[playerId] = data.voteIndex;

                const currentSubjectId = gameState.gameData.currentSubjectId;
                const voters = Object.keys(gameState.players).filter(id => id !== currentSubjectId);
                const currentVotes = Object.keys(gameState.gameData.votes).length;

                if (currentVotes >= voters.length) {
                    this.revealResult(gameState);
                }
            }
        } else if (gameState.gameData.phase === 'REVEAL') {
            // Next round manual trigger or auto? 
            // Usually handled by nextRound event from host, handled in RoomManager via general game-specific next action?
            // For now, we rely on Host clicking "Next" which calls generic nextRound
        }
    }

    startVotingPhase(gameState: GameState) {
        gameState.gameData.phase = 'VOTING';
        gameState.gameData.currentSubjectId = Object.keys(gameState.players)[0]; // Start with first player
        gameState.gameData.votes = {};
        gameState.gameData.showLie = false;

        // Edge case: 1 player (testing)
        if (Object.keys(gameState.players).length === 1) {
            this.revealResult(gameState);
        }
    }

    revealResult(gameState: GameState) {
        gameState.gameData.showLie = true;
        gameState.gameData.phase = 'REVEAL';

        const subjectId = gameState.gameData.currentSubjectId;
        const subjectData = gameState.gameData.inputs[subjectId];
        const actualLieIndex = subjectData.lieIndex;

        // Scoring
        Object.entries(gameState.gameData.votes).forEach(([voterId, voteIdx]: [string, any]) => {
            if (voteIdx === actualLieIndex) {
                // Correct guess
                if (gameState.players[voterId]) gameState.players[voterId].score += 50;
            } else {
                // Fooled them! Subject gets points
                if (gameState.players[subjectId]) gameState.players[subjectId].score += 25;
            }
        });
    }

    nextRound(gameState: GameState) {
        if (gameState.gameData.phase === 'REVEAL') {
            const playerIds = Object.keys(gameState.players);
            const currentIdx = playerIds.indexOf(gameState.gameData.currentSubjectId);
            const nextIdx = currentIdx + 1;

            if (nextIdx < playerIds.length) {
                gameState.gameData.phase = 'VOTING';
                gameState.gameData.currentSubjectId = playerIds[nextIdx];
                gameState.gameData.votes = {};
                gameState.gameData.showLie = false;
            } else {
                gameState.status = 'RESULTS';
            }
        }
    }

    onEnd(gameState: GameState) {
        // Cleanup
    }
}
