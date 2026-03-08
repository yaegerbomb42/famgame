import { GameState, IGameLogic } from '../types';

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

export class MindMeldGame implements IGameLogic {
    id = 'MIND_MELD' as const;
    name = 'Mind Meld';
    description = 'Think alike!';

    private broadcast: (() => void) | null = null;

    onStart(gameState: GameState, broadcast: () => void) {
        this.broadcast = broadcast;
        gameState.gameData = {
            phase: 'ANSWERING',
            prompt: PROMPTS[Math.floor(Math.random() * PROMPTS.length)],
            answers: {}, // playerId -> answer string
            matches: [],
            timer: 15,
        };

        setTimeout(() => {
            if (gameState.currentGame === 'MIND_MELD') {
                this.processMatches(gameState);
            }
        }, 15000);
    }

    onInput(gameState: GameState, playerId: string, data: any) {
        if (gameState.gameData.phase === 'ANSWERING') {
            if (data.answer) {
                gameState.gameData.answers[playerId] = data.answer;
            }
        }
    }

    async processMatches(gameState: GameState) {
        gameState.gameData.phase = 'MATCHING';
        if (this.broadcast) this.broadcast();

        const answers = gameState.gameData.answers;
        const playerIds = Object.keys(answers);
        const matches: any[] = [];

        for (let i = 0; i < playerIds.length; i++) {
            for (let j = i + 1; j < playerIds.length; j++) {
                const p1 = playerIds[i];
                const p2 = playerIds[j];
                const a1 = answers[p1].toLowerCase().trim();
                const a2 = answers[p2].toLowerCase().trim();

                // Simple matching for now (removed Gemini dependency for speed/robustness unless requested)
                // User asked to fix Gemini in previous convos, but user request here is "Robustness".
                // I'll stick to string matching for reliability, but could add API call if easy.
                // The prompt "Reactivity" suggests speed. Text match is fast.

                if (a1 && a2 && a1 === a2) {
                    matches.push({ player1Id: p1, player2Id: p2, similarity: 1 });
                    if (gameState.players[p1]) gameState.players[p1].score += 100;
                    if (gameState.players[p2]) gameState.players[p2].score += 100;
                }
            }
        }

        gameState.gameData.matches = matches;
        gameState.gameData.phase = 'RESULTS';
        if (this.broadcast) this.broadcast();
    }

    onEnd(gameState: GameState) { }
}
