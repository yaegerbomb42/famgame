import { GameState } from '../types';
import { BaseGame } from './logic/BaseGame';

const START_WORDS = ['Happy', 'Fire', 'Water', 'Music', 'Dream', 'Light', 'Star', 'Love', 'Power', 'Magic'];

export class ChainReactionGame extends BaseGame {
    id = 'CHAIN_REACTION' as const;
    name = 'Chain Reaction';
    description = 'Maintain the flow by connecting words in a high-speed word chain.';

    protected async initGameData(gameState: GameState): Promise<void> {
        gameState.gameData = {
            ...gameState.gameData,
            chain: [{ word: START_WORDS[Math.floor(Math.random() * START_WORDS.length)], playerId: 'system' }],
            lastSubmissions: [], // Show recently added words
            roundResults: {}
        };
        this.transitionTo(gameState, 'INTRO', 8);
    }

    protected async onTimerEnd(gameState: GameState, broadcast: () => void, roast: (c?: string, t?: string) => void): Promise<void> {
        if (this.phase === 'INTRO') {
            this.transitionTo(gameState, 'PLAYING', 45); // More time for parallel
        } else if (this.phase === 'PLAYING') {
            this.transitionTo(gameState, 'REVEAL', 8);
        } else if (this.phase === 'REVEAL') {
            this.onEnd(gameState, broadcast, roast);
        }
        broadcast();
    }

    protected async handlePlayerInput(gameState: GameState, playerId: string, data: any, broadcast: () => void, roast: (c?: string, t?: string) => void): Promise<void> {
        if (this.phase === 'PLAYING') {
            if (data.word && data.word.length > 1) {
                const word = data.word.trim();
                const lastWord = gameState.gameData.chain[gameState.gameData.chain.length - 1].word;
                
                // Optional: Check if word is already in chain
                const exists = gameState.gameData.chain.some((c: any) => c.word.toLowerCase() === word.toLowerCase());
                if (exists) return;

                // Validation: Must start with last letter of previous word? 
                // Actually let's just make it a free-for-all association for speed.
                gameState.gameData.chain.push({ word, playerId });
                
                // Track recent for UI effects
                gameState.gameData.lastSubmissions = [{ word, playerId }, ...gameState.gameData.lastSubmissions].slice(0, 5);

                // Award points
                this.awardPoints(gameState, playerId, 100);

                // Reset timer for the WHOLE ROOM to keep the pressure on
                this.timer = Math.max(10, this.timer - 1); // Pressure increases!
                gameState.gameData.timer = this.timer;
                
                broadcast();
            }
        }
    }
}
