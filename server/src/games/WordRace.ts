import { GameState, IGameLogic } from '../types';

const WORD_RACE_CATEGORIES = [
    "Animals", "Fruits", "Countries", "Brands", "Movies", "Colors", "Sports",
    "Vegetables", "Cities", "Cars", "Body Parts", "Jobs", "Clothes",
    "Furniture", "Tools", "Instruments", "Toys", "Drinks", "Flowers"
];

export class WordRaceGame implements IGameLogic {
    id = 'WORD_RACE' as const;
    name = 'Word Race';
    description = 'Type fast!';

    onStart(gameState: GameState, broadcast: () => void) {
        gameState.gameData = {
            category: WORD_RACE_CATEGORIES[Math.floor(Math.random() * WORD_RACE_CATEGORIES.length)],
            words: [],
            scores: {},
            endTime: Date.now() + 45000, // 45 seconds
            active: true
        };

        // Auto-end timer
        setTimeout(() => {
            if (gameState.currentGame === 'WORD_RACE') {
                gameState.gameData.active = false;
                gameState.gameData.phase = 'RESULTS'; // Or just end
                broadcast();
            }
        }, 45000);
    }

    onInput(gameState: GameState, playerId: string, data: any) {
        if (!gameState.gameData.active) return;

        // Data: { word: string }
        const word = data.word;
        if (!word || typeof word !== 'string') return;

        // Validation
        if (word.length < 3) return;

        // Duplicate check (per player? or global? Code implies per player is OK if logic allows, but usually word race is unique words?)
        // Original logic: "No duplicates for same player".
        // Let's enforce unique words globally for more challenge? No, standard is per player usually, but let's stick to simple "no repeats for YOU".
        const alreadyTyped = gameState.gameData.words.some((w: any) => w.word.toLowerCase() === word.toLowerCase() && w.playerId === playerId);
        if (alreadyTyped) return;

        // Scoring (lenient)
        if (!gameState.gameData.scores[playerId]) gameState.gameData.scores[playerId] = 0;
        gameState.gameData.scores[playerId] += 10;

        if (gameState.players[playerId]) gameState.players[playerId].score += 10;

        gameState.gameData.words.push({
            playerId,
            word,
            timestamp: Date.now()
        });
    }

    onEnd(gameState: GameState) { }
}
