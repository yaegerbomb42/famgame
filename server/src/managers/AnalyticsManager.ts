import fs from 'fs';
import path from 'path';

interface AnalyticsData {
    totalVisits: number;
    allTimePlayers: number;
    accountCreations: number;
    locations: Record<string, number>;
    referrals: Record<string, number>;
    lastUpdate: number;
}

const ANALYTICS_PATH = path.join(process.cwd(), 'analytics.json');

export class AnalyticsManager {
    private static data: AnalyticsData = {
        totalVisits: 0,
        allTimePlayers: 0,
        accountCreations: 0,
        locations: {},
        referrals: {},
        lastUpdate: Date.now()
    };

    static load() {
        if (fs.existsSync(ANALYTICS_PATH)) {
            try {
                this.data = JSON.parse(fs.readFileSync(ANALYTICS_PATH, 'utf-8'));
            } catch (e) {
                console.error('Failed to load analytics:', e);
            }
        }
    }

    private static save() {
        this.data.lastUpdate = Date.now();
        fs.writeFileSync(ANALYTICS_PATH, JSON.stringify(this.data, null, 2));
    }

    static logVisit(referrer: string = 'Direct', location: string = 'Unknown') {
        this.load();
        this.data.totalVisits++;
        
        // Clean up referrer
        try {
            if (referrer && referrer.startsWith('http')) {
                referrer = new URL(referrer).hostname;
            }
        } catch (e) {}

        this.data.referrals[referrer] = (this.data.referrals[referrer] || 0) + 1;
        this.data.locations[location] = (this.data.locations[location] || 0) + 1;
        this.save();
    }

    static incrementPlayers() {
        this.load();
        this.data.allTimePlayers++;
        this.save();
    }

    static incrementAccounts() {
        this.load();
        this.data.accountCreations++;
        this.save();
    }

    static getStats() {
        this.load();
        return this.data;
    }
}
