import { GameState } from '../types';
import { BaseGame } from './logic/BaseGame';

const STAT_ENTITIES = [
    { name: 'ChatGPT', activeUsers: 180000000, monthlyRevenue: 200000000, valuation: 80000000000 },
    { name: 'Netflix', activeUsers: 260000000, monthlyRevenue: 2800000000, valuation: 250000000000 },
    { name: 'Spotify', activeUsers: 602000000, monthlyRevenue: 3200000000, valuation: 50000000000 },
    { name: 'TikTok', activeUsers: 1100000000, monthlyRevenue: 800000000, valuation: 220000000000 },
    { name: 'Instagram', activeUsers: 2000000000, monthlyRevenue: 4000000000, valuation: 400000000000 },
    { name: 'YouTube', activeUsers: 2500000000, monthlyRevenue: 2500000000, valuation: 300000000000 },
    { name: 'X (Twitter)', activeUsers: 500000000, monthlyRevenue: 200000000, valuation: 19000000000 },
    { name: 'Tesla Model 3', unitsSold: 2000000, price: 40000, safetyRating: 98 },
    { name: 'iPhone 15', unitsSold: 80000000, price: 999, safetyRating: 95 },
    { name: 'PlayStation 5', unitsSold: 54000000, price: 499, safetyRating: 90 },
    { name: 'Bitcoin', activeHolders: 50000000, marketCap: 1200000000000, dailyVolume: 30000000000 },
    { name: 'Ethereum', activeHolders: 100000000, marketCap: 400000000000, dailyVolume: 15000000000 },
];

const STAT_LABELS: Record<string, string> = {
    activeUsers: 'Active Users',
    monthlyRevenue: 'Monthly Revenue ($)',
    valuation: 'Valuation ($)',
    unitsSold: 'Units Sold',
    price: 'Price ($)',
    safetyRating: 'Safety Rating',
    activeHolders: 'Active Holders',
    marketCap: 'Market Cap ($)',
    dailyVolume: 'Daily Volume ($)'
};

export class ThisOrThatGame extends BaseGame {
    id = 'THIS_OR_THAT' as const;
    name = 'Higher or Lower';
    description = 'Compare statistics of world-famous entities and guess: Higher or Lower?';

    protected async initGameData(gameState: GameState): Promise<void> {
        const round = 1;
        const totalRounds = 10;
        
        const { cardA, cardB, statKey } = this.generateMatchup();

        gameState.gameData = {
            ...gameState.gameData,
            round,
            totalRounds,
            cardA,
            cardB,
            statKey,
            statLabel: STAT_LABELS[statKey],
            submissions: {}, // pid -> 'HIGHER' | 'LOWER'
            roundResults: {}
        };
        this.transitionTo(gameState, 'INTRO', 8);
    }

    private generateMatchup() {
        type StatEntity = typeof STAT_ENTITIES[number];
        let entityA: StatEntity | undefined;
        let entityB: StatEntity | undefined;
        let statKey: string | undefined;
        
        // Loop until we find a pair with common stats
        let attempts = 0;
        while (attempts < 50) {
            entityA = STAT_ENTITIES[Math.floor(Math.random() * STAT_ENTITIES.length)];
            entityB = STAT_ENTITIES[Math.floor(Math.random() * STAT_ENTITIES.length)];
            
            if (entityA.name !== entityB.name) {
                const commonStats = Object.keys(entityA).filter(k => k !== 'name' && k in entityB!);
                if (commonStats.length > 0) {
                    statKey = commonStats[Math.floor(Math.random() * commonStats.length)];
                    break;
                }
            }
            attempts++;
        }

        // Fallback to first two entities and first stat if randomization fails
        if (!statKey || !entityA || !entityB) {
            entityA = STAT_ENTITIES[0];
            entityB = STAT_ENTITIES[1];
            statKey = 'activeUsers';
        }

        return {
            cardA: { name: entityA.name, value: (entityA as any)[statKey] },
            cardB: { name: entityB.name, value: (entityB as any)[statKey] },
            statKey
        };
    }

    protected async onTimerEnd(gameState: GameState, broadcast: () => void, roast: (c?: string, t?: string) => void): Promise<void> {
        if (this.phase === 'INTRO') {
            this.transitionTo(gameState, 'PLAYING', 20);
        } else if (this.phase === 'PLAYING') {
            this.resolveHigherLower(gameState);
            this.transitionTo(gameState, 'REVEAL', 10);
        } else if (this.phase === 'REVEAL') {
            if (gameState.gameData.round < gameState.gameData.totalRounds) {
                gameState.gameData.round++;
                const { cardA, cardB, statKey } = this.generateMatchup();
                gameState.gameData.cardA = cardA;
                gameState.gameData.cardB = cardB;
                gameState.gameData.statKey = statKey;
                gameState.gameData.statLabel = STAT_LABELS[statKey];
                gameState.gameData.submissions = {};
                this.transitionTo(gameState, 'PLAYING', 20);
            } else {
                this.onEnd(gameState, broadcast, roast);
            }
        }
        broadcast();
    }

    protected async handlePlayerInput(gameState: GameState, playerId: string, data: any, broadcast: () => void, roast: (c?: string, t?: string) => void): Promise<void> {
        if (this.phase === 'PLAYING') {
            if (data.choice === 'HIGHER' || data.choice === 'LOWER') {
                gameState.gameData.submissions[playerId] = data.choice;
                if (Object.keys(gameState.gameData.submissions).length >= this.getActivePlayerCount(gameState)) {
                    await this.onTimerEnd(gameState, broadcast, roast);
                }
            }
        }
    }

    private resolveHigherLower(gameState: GameState) {
        const { cardA, cardB, submissions } = gameState.gameData;
        const correct = cardB.value > cardA.value ? 'HIGHER' : 'LOWER';

        Object.entries(submissions).forEach(([pid, choice]) => {
            if (choice === correct) {
                this.awardPoints(gameState, pid, 100);
            }
        });
    }
}
