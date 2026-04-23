import { GameState, GameType } from '../types';
import { BaseGame } from './logic/BaseGame';
import { AIGenerator } from '../utils/AIGenerator';

const PROMPTS = [
    'Name a pizza topping',
    'Name a superhero',
    'Name a country',
    'Name something yellow',
    'Name a movie genre',
    'Name a breakfast food',
    'Name something you find at the beach',
    'Name a sport',
];

export class MindMeldGame extends BaseGame {
    id = 'MIND_MELD' as const;
    name = 'Mind Meld';
    description = 'Synchronize your thoughts with other players to submit identical answers.';

    protected async initGameData(gameState: GameState): Promise<void> {
        gameState.gameData = {
            ...gameState.gameData,
            phase: 'INTRO',
            prompt: 'Generating...',
            submissions: {}, // pid -> answer
            matches: [],
            roundResults: {}
        };

        try {
            const p = await AIGenerator.generateMindMeldPrompt();
            gameState.gameData.prompt = p;
        } catch (e) {
            gameState.gameData.prompt = 'Name a pizza topping';
        }
        
        this.transitionTo(gameState, 'INTRO', 8);
    }

    protected async onTimerEnd(gameState: GameState, broadcast: () => void, roast: (c?: string, t?: string) => void): Promise<void> {
        if (this.phase === 'INTRO') {
            this.transitionTo(gameState, 'PLAYING', 60); // Increased from 45
        } else if (this.phase === 'PLAYING') {
            this.phase = 'PROCESSING';
            broadcast(); // Notify players we are judging
            await this.processMatches(gameState);
            this.transitionTo(gameState, 'REVEAL', 10);
        } else if (this.phase === 'REVEAL') {
            this.onEnd(gameState, broadcast, roast);
        }
        broadcast();
    }

    protected async handlePlayerInput(gameState: GameState, playerId: string, data: any, broadcast: () => void, roast: (c?: string, t?: string) => void): Promise<void> {
        if (this.phase === 'PLAYING') {
            if (data.answer) {
                gameState.gameData.submissions[playerId] = data.answer.toLowerCase().trim();
                if (Object.keys(gameState.gameData.submissions).length >= this.getActivePlayerCount(gameState)) {
                    await this.onTimerEnd(gameState, broadcast, roast);
                }
            }
        }
    }

    private async processMatches(gameState: GameState) {
        const answers = gameState.gameData.submissions;
        const playerIds = Object.keys(answers);
        const matches: any[] = [];
        
        const awardedLinks = new Set<string>();

        for (let i = 0; i < playerIds.length; i++) {
            for (let j = i + 1; j < playerIds.length; j++) {
                const p1 = playerIds[i];
                const p2 = playerIds[j];
                const a1 = answers[p1];
                const a2 = answers[p2];

                if (a1 && a2) {
                    const similarity = await AIGenerator.checkSemanticSimilarity(a1, a2);
                    
                    if (similarity >= 0.8) {
                        const isPerfect = similarity >= 1.0;
                        const points = isPerfect ? 200 : 100;
                        
                        matches.push({ p1, p2, a1, a2, similarity, isPerfect });
                        
                        this.awardPoints(gameState, p1, points);
                        this.awardPoints(gameState, p2, points);
                    }
                }
            }
        }
        gameState.gameData.matches = matches;
    }
}
