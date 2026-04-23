import { GameState } from '../types';
import { BaseGame } from './logic/BaseGame';
import { AIGenerator } from '../utils/AIGenerator';

const EMOJI_PROMPTS = ['Your morning routine', 'A movie plot', 'Your biggest fear', 'Your dream vacation', 'A love story', 'A horror story', 'Your last meal'];

export class EmojiStoryGame extends BaseGame {
    id = 'EMOJI_STORY' as const;
    name = 'Emoji Story';
    description = 'Translate complex phrases and stories using only a limited set of emojis.';

    protected async initGameData(gameState: GameState): Promise<void> {
        gameState.gameData = {
            ...gameState.gameData,
            prompt: 'Generating...',
            submissions: {}, // pid -> emojis
            votes: {},       // pid -> votedPid
            subPhase: 'INPUT',
            roundResults: {}
        };

        try {
            const p = await AIGenerator.generateEmojiStoryPrompt();
            gameState.gameData.prompt = p;
        } catch (e) {
            gameState.gameData.prompt = 'Your morning routine';
        }
        
        this.transitionTo(gameState, 'INTRO', 8);
    }

    protected async onTimerEnd(gameState: GameState, broadcast: () => void, roast: (c?: string, t?: string) => void): Promise<void> {
        const { subPhase } = gameState.gameData;

        if (this.phase === 'INTRO') {
            this.transitionTo(gameState, 'PLAYING', 45);
        } else if (this.phase === 'PLAYING') {
            if (subPhase === 'INPUT') {
                gameState.gameData.subPhase = 'VOTE';
                if (this.getActivePlayerCount(gameState) <= 1) {
                    await this.resolveVotes(gameState);
                    this.transitionTo(gameState, 'REVEAL', 10);
                } else {
                    this.transitionTo(gameState, 'PLAYING', 30);
                }
            } else {
                this.phase = 'PROCESSING';
                broadcast();
                await this.resolveVotes(gameState);
                this.transitionTo(gameState, 'REVEAL', 10);
            }
        } else if (this.phase === 'REVEAL') {
            this.onEnd(gameState, broadcast, roast);
        }
        broadcast();
    }

    protected async handlePlayerInput(gameState: GameState, playerId: string, data: any, broadcast: () => void, roast: (c?: string, t?: string) => void): Promise<void> {
        const { subPhase } = gameState.gameData;

        if (this.phase === 'PLAYING') {
            if (subPhase === 'INPUT') {
                const story = data.story ?? data.emoji;
                if (story) {
                    gameState.gameData.submissions[playerId] = story;
                    if (Object.keys(gameState.gameData.submissions).length >= this.getActivePlayerCount(gameState)) {
                        await this.onTimerEnd(gameState, broadcast, roast);
                    }
                }
            } else if (subPhase === 'VOTE') {
                const pick = data.targetPid ?? data.vote;
                if (pick) {
                    gameState.gameData.votes[playerId] = pick;
                    if (Object.keys(gameState.gameData.votes).length >= this.getActivePlayerCount(gameState)) {
                        await this.onTimerEnd(gameState, broadcast, roast);
                    }
                }
            }
        }
    }

    private async resolveVotes(gameState: GameState) {
        // Player votes
        Object.values(gameState.gameData.votes).forEach((targetId: any) => {
            this.awardPoints(gameState, targetId, 100);
        });

        // AI Judge
        const submissions = gameState.gameData.submissions;
        if (Object.keys(submissions).length > 0) {
            const aiVerdict = await AIGenerator.judgeEmojiStory(gameState.gameData.prompt, submissions);
            if (aiVerdict && aiVerdict.winnerId && submissions[aiVerdict.winnerId]) {
                this.awardPoints(gameState, aiVerdict.winnerId, 250); // Bonus for AI winner
                gameState.gameData.aiWinner = aiVerdict;
            }
        }
    }
}
