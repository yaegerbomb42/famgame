import { GameState, GameType } from '../types';
import { BaseGame } from './logic/BaseGame';
import { AIGenerator } from '../utils/AIGenerator';

const DEFAULT_MASHUP_PROMPTS = [
    'A robot learning to bake',
    'A pirate at a tea party',
    'A cactus running a marathon',
    'A dinosaur in a library',
    'A toaster in space',
];

export class AIMashupGame extends BaseGame {
    id = 'AI_MASHUP' as GameType;
    name = 'AI Mashup';
    description = 'Combine weird prompts to create AI masterpieces!';

    protected async initGameData(gameState: GameState, broadcast: () => void, roast: (c?: string, t?: string) => void): Promise<void> {
        gameState.gameData = {
            ...gameState.gameData,
            phase: 'INTRO',
            prompts: [...DEFAULT_MASHUP_PROMPTS],
            submissions: {},
            round: 0,
        };

        try {
            const prompts = await AIGenerator.generateAIMashupPrompts(5);
            if (prompts && prompts.length > 0) {
                gameState.gameData.prompts = prompts;
            }
        } catch (e) {
            console.error('AIMashup: AI prompt generation failed.');
        }

        this.transitionTo(gameState, 'INTRO', 8);
    }

    protected async handlePlayerInput(gameState: GameState, playerId: string, data: any, broadcast: () => void, roast: (c?: string, t?: string) => void): Promise<void> {
        if (this.phase !== 'PLAYING') return;

        if (data.prompt) {
            gameState.gameData.submissions[playerId] = {
                prompt: data.prompt,
                timestamp: Date.now()
            };

            const total = this.getActivePlayerCount(gameState);
            if (Object.keys(gameState.gameData.submissions).length >= total) {
                await this.onTimerEnd(gameState, broadcast, roast);
            }
        }
    }

    protected async onTimerEnd(gameState: GameState, broadcast: () => void, roast: (c?: string, t?: string) => void): Promise<void> {
        if (this.phase === 'INTRO') {
            this.transitionTo(gameState, 'PLAYING', 60); // Increased from 45
        } else if (this.phase === 'PLAYING') {
            this.transitionTo(gameState, 'REVEAL', 15);
            this.calculateScores(gameState);
        } else if (this.phase === 'REVEAL') {
            this.onEnd(gameState, broadcast, roast);
        }
        broadcast();
    }

    private calculateScores(gameState: GameState) {
        // Simple "submission bonus" for now, or AI scoring if integrated
        Object.keys(gameState.gameData.submissions).forEach(pid => {
            this.awardPoints(gameState, pid, 500);
        });
    }
}
