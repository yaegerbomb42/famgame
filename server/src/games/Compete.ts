import { GameState } from '../types';
import { BaseGame } from './logic/BaseGame';

export class CompeteGame extends BaseGame {
    id = 'COMPETE' as const;
    name = 'Compete';
    description = 'Go head-to-head in a intense 1v1 battle of speed and wits.';

    protected async initGameData(gameState: GameState): Promise<void> {
        gameState.gameData = {
            ...gameState.gameData,
            round: 1,
            totalRounds: 3,
            challengerIds: [],
            challengeType: null,
            target: null,
            scores: {},
            winnerId: null,
            roundResults: {}
        };
        this.prepareRound(gameState);
        this.transitionTo(gameState, 'INTRO', 8);
    }

    private prepareRound(gameState: GameState) {
        const playerIds = this.getNonHostPlayerIds(gameState);
        const shuffled = [...playerIds].sort(() => Math.random() - 0.5);
        const challengers = shuffled.length <= 1 ? shuffled.slice(0, 1) : shuffled.slice(0, 2);
        
        const challenges = [
            {
                type: 'TAP',
                target: 20,
                title: 'Hit the Center',
                instruction: 'Tap exactly when the moving pulse lines up with the center glow! Speed increases with every hit.',
            },
            { type: 'TYPE', target: 'The quick brown fox', title: 'Typing Test', instruction: 'Type the phrase perfectly as fast as you can!' },
        ];

        const challenge = challenges[Math.floor(Math.random() * challenges.length)];

        gameState.gameData.challengerIds = challengers;
        gameState.gameData.challengeType = challenge.type;
        gameState.gameData.target = challenge.target;
        gameState.gameData.scores = {};
        gameState.gameData.winnerId = null;
    }

    protected async onTimerEnd(gameState: GameState, broadcast: () => void, roast: (c?: string, t?: string) => void): Promise<void> {
        if (this.phase === 'INTRO') {
            this.transitionTo(gameState, 'PLAYING', 30); // Increased from 15
            gameState.gameData.scores = {};
        } else if (this.phase === 'PLAYING') {
            this.transitionTo(gameState, 'REVEAL', 5);
        } else if (this.phase === 'REVEAL') {
            if (gameState.gameData.round < gameState.gameData.totalRounds) {
                gameState.gameData.round++;
                this.prepareRound(gameState);
                this.transitionTo(gameState, 'INTRO', 5);
            } else {
                this.onEnd(gameState, broadcast, roast);
            }
        }
        broadcast();
    }

    protected async handlePlayerInput(gameState: GameState, playerId: string, data: any, broadcast: () => void, roast: (c?: string, t?: string) => void): Promise<void> {
        if (this.phase === 'PLAYING') {
            const { challengerIds, challengeType, target } = gameState.gameData;
            if (!challengerIds.includes(playerId)) return;

            if (data.score !== undefined) {
                gameState.gameData.scores[playerId] = data.score;
                
                const winThreshold = challengeType === 'TAP' ? target : target.length;
                if (data.score >= winThreshold) {
                    await this.resolveWinner(gameState, playerId);
                }
            }
        }
    }

    private async resolveWinner(gameState: GameState, winnerId: string) {
        gameState.gameData.winnerId = winnerId;
        this.awardPoints(gameState, winnerId, 200);
        this.transitionTo(gameState, 'REVEAL', 5);
    }
}
