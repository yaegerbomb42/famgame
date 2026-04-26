import { GameState } from '../types';
import { BaseGame } from './logic/BaseGame';

import { AIGenerator } from '../utils/AIGenerator';

export class HotTakesGame extends BaseGame {
    id = 'HOT_TAKES' as const;
    name = 'Hot Takes';
    description = 'Defend your most controversial opinions and see who joins your side.';
    
    protected introTime = 6;

    protected async initGameData(gameState: GameState): Promise<void> {
        gameState.gameData = {
            ...gameState.gameData,
            prompt: 'Loading spicy takes...',
            submissions: {}, // pid -> text
            votes: {},       // pid -> votedPid
            subPhase: 'NONE',
            currentRound: 0,
            totalRounds: 1, // Only playing 1 round for Hot Takes
            roundResults: {}
        };

        const aiPromise = AIGenerator.generateHotTakesPrompt();
        const fallbackPromise = new Promise<string>(resolve => setTimeout(() => resolve('Is a hotdog a sandwich?'), 3000));
        
        gameState.gameData.prompt = await Promise.race([aiPromise, fallbackPromise]);
    }

    protected async onTimerEnd(gameState: GameState, broadcast: () => void, roast: (c?: string, t?: string) => void): Promise<void> {
        if (this.phase === 'INTRO') {
            gameState.gameData.subPhase = 'INPUT';
            this.transitionTo(gameState, 'PLAYING', 35);
        } else if (this.phase === 'PLAYING') {
            if (gameState.gameData.subPhase === 'INPUT') {
                gameState.gameData.subPhase = 'VOTE';
                this.transitionTo(gameState, 'PLAYING', 18);
            } else if (gameState.gameData.subPhase === 'VOTE') {
                this.resolveVotes(gameState);
                this.transitionTo(gameState, 'REVEAL', 7);
            }
        } else if (this.phase === 'REVEAL') {
            if (gameState.gameData.currentRound < gameState.gameData.totalRounds - 1) {
                gameState.gameData.currentRound++;
                gameState.gameData.votes = {};
                gameState.gameData.submissions = {};
                
                // Fetch next prompt
                const newPrompt = await AIGenerator.generateHotTakesPrompt();
                gameState.gameData.prompt = newPrompt || 'What is the most overrated movie?';
                
                gameState.gameData.subPhase = 'INPUT';
                this.transitionTo(gameState, 'PLAYING', 35);
            } else {
                this.onEnd(gameState, broadcast, roast);
            }
        }
        broadcast();
    }

    protected async handlePlayerInput(gameState: GameState, playerId: string, data: any, broadcast: () => void, roast: (c?: string, t?: string) => void): Promise<void> {
        const subPhase = gameState.gameData.subPhase;
        
        if (this.phase === 'PLAYING' && subPhase === 'INPUT') {
            if (typeof data.submission === 'string' && !gameState.gameData.submissions[playerId]) {
                gameState.gameData.submissions[playerId] = data.submission;
                if (Object.keys(gameState.gameData.submissions).length >= this.getActivePlayerCount(gameState)) {
                    await this.onTimerEnd(gameState, broadcast, roast);
                }
            }
        } else if (this.phase === 'PLAYING' && subPhase === 'VOTE') {
            if (typeof data.vote === 'string' && !gameState.gameData.votes[playerId]) {
                gameState.gameData.votes[playerId] = data.vote;
                if (Object.keys(gameState.gameData.votes).length >= this.getActivePlayerCount(gameState)) {
                    await this.onTimerEnd(gameState, broadcast, roast);
                }
            }
        }
    }

    private resolveVotes(gameState: GameState) {
        Object.values(gameState.gameData.votes).forEach((targetId: any) => {
            this.awardPoints(gameState, targetId, 100);
        });
    }
}
