import fs from 'fs';
import path from 'path';
import { AnalyticsManager } from './AnalyticsManager';

interface HostAccount {
    username: string;
    keyHash: string; // Simplistic "password" for now
    geminiKey: string;
}

interface DB {
    hosts: HostAccount[];
}

const DB_PATH = path.join(process.cwd(), 'db.json');

export class HostManager {
    private static db: DB = { hosts: [] };

    static load() {
        if (fs.existsSync(DB_PATH)) {
            try {
                this.db = JSON.parse(fs.readFileSync(DB_PATH, 'utf-8'));
            } catch (e) {
                console.error('Failed to load DB:', e);
            }
        }
    }

    private static save() {
        fs.writeFileSync(DB_PATH, JSON.stringify(this.db, null, 2));
    }

    static registerOrLogin(username: string, keyHash: string, geminiKey?: string): HostAccount | null {
        this.load();
        let host = this.db.hosts.find(h => h.username === username);

        if (host) {
            if (host.keyHash === keyHash) {
                if (geminiKey) {
                    host.geminiKey = geminiKey;
                    this.save();
                }
                return host;
            }
            return null; // Wrong password
        }

        // New host
        const newHost = { username, keyHash, geminiKey: geminiKey || '' };
        this.db.hosts.push(newHost);
        this.save();
        AnalyticsManager.incrementAccounts();
        return newHost;
    }

    static getGeminiKey(username: string): string | null {
        this.load();
        const host = this.db.hosts.find(h => h.username === username);
        return host ? host.geminiKey : null;
    }
}
