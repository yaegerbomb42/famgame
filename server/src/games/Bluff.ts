import { GameState } from '../types';
import { BaseGame } from './logic/BaseGame';

export class BluffGame extends BaseGame {
    id = 'BLUFF' as const;
    name = 'Bluff';
    description = 'Fabricate the most believable lie to deceive your friends and spot the truth.';

    protected async initGameData(gameState: GameState): Promise<void> {
        gameState.gameData = {
            ...gameState.gameData,
            round: 1,
            totalRounds: 3,
            submissions: {}, 
            votes: {},       
            subjectId: null,
            subPhase: 'INPUT',
            votedPlayers: {},
            roundResults: {}
        };
        this.transitionTo(gameState, 'INTRO', 10);
    }

    protected async onTimerEnd(gameState: GameState, broadcast: () => void, roast: (c?: string, t?: string) => void): Promise<void> {
        const { subPhase, round, totalRounds, submissions } = gameState.gameData;

        if (this.phase === 'INTRO') {
            gameState.gameData.subPhase = 'INPUT';
            this.transitionTo(gameState, 'PLAYING', 120); // 2 minutes for writing
        } else if (this.phase === 'PLAYING') {
            if (subPhase === 'INPUT') {
                const subIds = Object.keys(submissions);
                if (subIds.length === 0) {
                    this.onEnd(gameState, broadcast, roast);
                    return;
                }
                
                const subjectId = subIds[Math.floor(Math.random() * subIds.length)];
                gameState.gameData.subjectId = subjectId;
                gameState.gameData.subPhase = 'VOTING';
                gameState.gameData.votes = {};
                gameState.gameData.votedPlayers = {};
                this.transitionTo(gameState, 'PLAYING', 60); // 60s for group voting
            } else {
                this.resolveBluff(gameState);
                this.transitionTo(gameState, 'REVEAL', 12);
            }
        } else if (this.phase === 'REVEAL') {
            if (round < totalRounds) {
                gameState.gameData.round++;
                gameState.gameData.submissions = {};
                gameState.gameData.votes = {};
                gameState.gameData.votedPlayers = {};
                gameState.gameData.subjectId = null;
                gameState.gameData.subPhase = 'INPUT';
                this.transitionTo(gameState, 'PLAYING', 120);
            } else {
                this.onEnd(gameState, broadcast, roast);
            }
        }
        broadcast();
    }

    protected async handlePlayerInput(gameState: GameState, playerId: string, data: any, broadcast: () => void, roast: (c?: string, t?: string) => void): Promise<void> {
        const { subPhase, subjectId } = gameState.gameData;

        if (this.phase === 'PLAYING') {
            if (subPhase === 'INPUT') {
                if (data.claim !== undefined && data.isLying !== undefined) {
                    gameState.gameData.submissions[playerId] = {
                        claim: data.claim,
                        isLying: data.isLying
                    };
                    
                    if (Object.keys(gameState.gameData.submissions).length >= this.getActivePlayerCount(gameState)) {
                        await this.onTimerEnd(gameState, broadcast, roast);
                    }
                }
            } else if (subPhase === 'VOTING' && playerId !== subjectId) {
                if (data.vote !== undefined && !gameState.gameData.votedPlayers[playerId]) {
                    gameState.gameData.votes[playerId] = data.vote;
                    gameState.gameData.votedPlayers[playerId] = true;
                    
                    const neededVotes = this.getActivePlayerCount(gameState) - 1;
                    if (Object.keys(gameState.gameData.votedPlayers).length >= neededVotes) {
                        await this.onTimerEnd(gameState, broadcast, roast);
                    }
                }
            }
        }
    }

    private resolveBluff(gameState: GameState) {
        const { subjectId, submissions, votes } = gameState.gameData;
        if (!subjectId || !submissions[subjectId]) return;

        const actualIsLying = submissions[subjectId].isLying;
        
        Object.entries(votes).forEach(([voterId, vote]: [string, any]) => {
            const correct = (vote === actualIsLying);
            if (correct) {
                this.awardPoints(gameState, voterId, 200);
            } else {
                this.awardPoints(gameState, subjectId, 100);
            }
        });
    }
}
