import { GameState, IGameLogic } from '../types';

const CHOICES = [
    ['🍕 Pizza', '🍔 Burger'],
    ['🏖️ Beach', '⛰️ Mountains'],
    ['🎬 Movies', '📺 TV Shows'],
    ['☕ Coffee', '🍵 Tea'],
    ['🌅 Morning', '🌃 Night'],
    ['💰 Rich & Lonely', '💕 Poor & Loved'],
    ['🦸 Fly', '🧠 Read Minds'],
    ['🔮 Past', '🚀 Future'],
];

export class ThisOrThatGame implements IGameLogic {
    id = 'THIS_OR_THAT' as const;
    name = 'This or That';
    description = 'Pick one!';

    onStart(gameState: GameState, broadcast: () => void) {
        this.nextRound(gameState, broadcast);
    }

    nextRound(gameState: GameState, broadcast?: () => void) {
        const choice = CHOICES[Math.floor(Math.random() * CHOICES.length)];
        gameState.gameData = {
            phase: 'CHOOSING',
            optionA: choice[0],
            optionB: choice[1],
            votes: {},
        };
        if (broadcast) broadcast();
    }

    onInput(gameState: GameState, playerId: string, data: any) {
        if (gameState.gameData.phase === 'CHOOSING') {
            // data: { choice: 'A' | 'B' }
            if (data.choice === 'A' || data.choice === 'B') {
                gameState.gameData.votes[playerId] = data.choice;
                // Wait for all or just update
            }
        }
    }

    onEnd(gameState: GameState) { }
}
