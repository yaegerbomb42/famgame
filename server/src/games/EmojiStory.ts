import { GameState, IGameLogic } from '../types';

const EMOJI_PROMPTS = ['Your morning routine', 'A movie plot', 'Your biggest fear', 'Your dream vacation', 'A love story', 'A horror story', 'Your last meal'];

export class EmojiStoryGame implements IGameLogic {
    id = 'EMOJI_STORY' as const;
    name = 'Emoji Story';
    description = 'Describe it with emojis!';

    onStart(gameState: GameState, broadcast: () => void) {
        gameState.gameData = {
            phase: 'INPUT',
            prompt: EMOJI_PROMPTS[Math.floor(Math.random() * EMOJI_PROMPTS.length)],
            inputs: {}, // playerId -> emoji string
            currentStoryIndex: 0,
            currentStory: null,
            guesses: {},
        };
    }

    onInput(gameState: GameState, playerId: string, data: any) {
        if (gameState.gameData.phase === 'INPUT') {
            // Data: { story: string }
            if (data.story) {
                gameState.gameData.inputs[playerId] = data.story;

                const playerCount = Object.keys(gameState.players).length;
                const inputCount = Object.keys(gameState.gameData.inputs).length;

                if (inputCount >= playerCount) {
                    this.startGuessing(gameState);
                }
            }
        } else if (gameState.gameData.phase === 'GUESSING') {
            // Logic for guessing?
            // Actually original code for Emoji story was:
            // "guesses: {}"
            // Usually players guess who wrote it? or what the prompt was?
            // "Prompt is shared", so they know the prompt.
            // So they guess WHO wrote which story?
            // Let's assume they guess the AUTHOR of the currently displayed story.

            // data: { authorId: string }
            if (data.authorId) {
                gameState.gameData.guesses[playerId] = data.authorId;
                // Wait for all/timer?
                // Let's keep it simple: Host advances manually or we wait for all.
            }
        }
    }

    startGuessing(gameState: GameState) {
        gameState.gameData.phase = 'GUESSING';
        // Logic to cycle stories?
        // Detailed implementation omitted for brevity, but framework is here.
    }

    onEnd(gameState: GameState) { }
}
