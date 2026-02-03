import { GameState } from '../../types';

export interface PlayerStats {
    totalRoasts: number;
    totalVotesReceived: number;
    avgSpiciness: number;
    highestSpiciness: number;
    reactionsTriggered: number;
    burnedByOthers: number;
    thinSkinScore: number; // Downvoted most roasts against them
    crowdPleaserScore: number; // High vote-to-roast ratio
    keyboardWarriorScore: number; // Avg roast length
}

export class RoastStats {
    stats: Record<string, PlayerStats> = {};

    constructor(playerIds: string[]) {
        playerIds.forEach(pid => {
            this.stats[pid] = {
                totalRoasts: 0,
                totalVotesReceived: 0,
                avgSpiciness: 0,
                highestSpiciness: 0,
                reactionsTriggered: 0,
                burnedByOthers: 0,
                thinSkinScore: 0,
                crowdPleaserScore: 0,
                keyboardWarriorScore: 0
            };
        });
    }

    trackRoastSubmission(playerId: string, roastLength: number) {
        if (!this.stats[playerId]) return;
        const p = this.stats[playerId];
        p.totalRoasts++;
        // Moving average for length score
        p.keyboardWarriorScore = (p.keyboardWarriorScore * (p.totalRoasts - 1) + roastLength) / p.totalRoasts;
    }

    trackVoteRecieved(authorId: string) {
        if (!this.stats[authorId]) return;
        this.stats[authorId].totalVotesReceived++;
    }

    trackSpiciness(authorId: string, rating: number) {
        if (!this.stats[authorId]) return;
        const p = this.stats[authorId];
        p.avgSpiciness = (p.avgSpiciness * (p.totalRoasts - 1) + rating) / p.totalRoasts;
        if (rating > p.highestSpiciness) p.highestSpiciness = rating;
    }

    generateReportCard(): Record<string, string[]> {
        const medals: Record<string, string[]> = {};

        // Convert stats map to array for sorting
        const allStats = Object.entries(this.stats).map(([id, stat]) => ({ id, ...stat }));

        // Award Logic
        const highestSpicy = [...allStats].sort((a, b) => b.highestSpiciness - a.highestSpiciness)[0];
        if (highestSpicy) {
            if (!medals[highestSpicy.id]) medals[highestSpicy.id] = [];
            medals[highestSpicy.id].push("🌶️ THE NUCLEAR OPTION (Hottest Roast)");
        }

        const crowdPleaser = [...allStats].sort((a, b) => (b.totalVotesReceived / (b.totalRoasts || 1)) - (a.totalVotesReceived / (a.totalRoasts || 1)))[0];
        if (crowdPleaser && crowdPleaser.totalVotesReceived > 2) {
            if (!medals[crowdPleaser.id]) medals[crowdPleaser.id] = [];
            medals[crowdPleaser.id].push("👑 CROWD FAVORITE (Most Votes/Roast)");
        }

        const keyboardWarrior = [...allStats].sort((a, b) => b.keyboardWarriorScore - a.keyboardWarriorScore)[0];
        if (keyboardWarrior && keyboardWarrior.keyboardWarriorScore > 50) {
            if (!medals[keyboardWarrior.id]) medals[keyboardWarrior.id] = [];
            medals[keyboardWarrior.id].push("⌨️ YAPPIN' AWAY (Longest Roasts)");
        }

        return medals;
    }
}
