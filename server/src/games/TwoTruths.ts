import { GameState } from '../types';
import { BaseGame } from './logic/BaseGame';

export class TwoTruthsGame extends BaseGame {
    id = '2TRUTHS' as const;
    name = '2 Truths & 1 Lie';
    description = 'Present two facts and one lie. Can your friends identify the deception?';

    protected introTime = 8;

    protected async initGameData(gameState: GameState): Promise<void> {
        const players = this.getNonHostPlayerIds(gameState);
        gameState.gameData = {
            ...gameState.gameData,
            submissions: {}, // pid -> { statements: [], lieIndex: number }
            votes: {},       // pid -> votedIdx
            subjectIndex: 0,
            playerOrder: players,
            subPhase: 'NONE',
            roundResults: {}
        };
    }

    protected async onTimerEnd(gameState: GameState, broadcast: () => void, roast: (c?: string, t?: string) => void): Promise<void> {
        const { subjectIndex, playerOrder, submissions, subPhase } = gameState.gameData;

        if (this.phase === 'INTRO') {
            // Intro is over, move to input phase
            gameState.gameData.subPhase = 'INPUT';
            this.transitionTo(gameState, 'PLAYING', 45);
        } else if (this.phase === 'PLAYING') {
            if (subPhase === 'INPUT') {
                if (Object.keys(submissions).length === 0) {
                    this.onEnd(gameState, broadcast, roast);
                    return;
                }
                gameState.gameData.playerOrder = playerOrder.filter((pid: string) => submissions[pid]);
                await this.startVoting(gameState, broadcast);
            } else if (subPhase === 'VOTING') {
                this.resolveVotes(gameState);
                this.transitionTo(gameState, 'REVEAL', 15);
            }
        } else if (this.phase === 'REVEAL') {
            const nextSubjectIndex = (gameState.gameData.subjectIndex || 0) + 1;
            const validPlayers = gameState.gameData.playerOrder;

            if (nextSubjectIndex < validPlayers.length) {
                gameState.gameData.subjectIndex = nextSubjectIndex;
                gameState.gameData.votes = {};
                await this.startVoting(gameState, broadcast);
            } else {
                this.onEnd(gameState, broadcast, roast);
            }
        }
        broadcast();
    }

    protected async handlePlayerInput(gameState: GameState, playerId: string, data: any, broadcast: () => void, roast: (c?: string, t?: string) => void): Promise<void> {
        const { subPhase, subjectIndex, playerOrder } = gameState.gameData;

        if (this.phase === 'PLAYING' && subPhase === 'INPUT') {
            if (data.statements && typeof data.lieIndex === 'number') {
                gameState.gameData.submissions[playerId] = data;
                if (Object.keys(gameState.gameData.submissions).length >= this.getActivePlayerCount(gameState)) {
                    await this.onTimerEnd(gameState, broadcast, roast);
                }
            }
        } else if (this.phase === 'PLAYING' && subPhase === 'VOTING') {
            const subjectId = playerOrder[subjectIndex];
            if (playerId === subjectId) return;

            if (typeof data.voteIndex === 'number') {
                gameState.gameData.votes[playerId] = data.voteIndex;
                const neededVotes = Math.max(0, this.getActivePlayerCount(gameState) - 1);
                if (neededVotes > 0 && Object.keys(gameState.gameData.votes).length >= neededVotes) {
                    await this.onTimerEnd(gameState, broadcast, roast);
                }
            }
        }
    }

    private async startVoting(gameState: GameState, broadcast: () => void) {
        gameState.gameData.subPhase = 'VOTING';
        gameState.gameData.votes = {};
        this.transitionTo(gameState, 'PLAYING', 30);
        broadcast();
    }

    private resolveVotes(gameState: GameState) {
        const subjectId = gameState.gameData.playerOrder[gameState.gameData.subjectIndex];
        const subjectData = gameState.gameData.submissions[subjectId];
        if (!subjectData) return;

        const actualLieIndex = subjectData.lieIndex;
        Object.entries(gameState.gameData.votes).forEach(([voterId, voteIdx]: [string, any]) => {
            if (voteIdx === actualLieIndex) {
                 this.awardPoints(gameState, voterId, 100);
            } else {
                 this.awardPoints(gameState, subjectId, 50);
            }
        });
    }
}
