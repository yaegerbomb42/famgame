import OpenAI from "openai";

interface Worker {
    id: string;
    provider: string;
    model: string;
    baseURL: string;
    apiKey: string;
    isBusy: boolean;
    cooldownUntil: number;
    currentCooldownMultiplier: number;
}

const COOLDOWNS: Record<string, number> = {
    gemini: 4500,     // Safe for 15 RPM
    groq: 2200,       // Safe for 30 RPM
    cerebras: 2200,
    nvidia: 2200,
    default: 1000,
};

export class SwarmEngine {
    private static instance: SwarmEngine;
    private workers: Worker[] = [];

    private constructor() { this.refreshWorkers(); }

    public static getInstance() {
        if (!this.instance) this.instance = new SwarmEngine();
        return this.instance;
    }

    public refreshWorkers() {
        this.workers = [];
        const configs = [
            { name: "gemini", baseURL: "https://generativelanguage.googleapis.com/v1beta/openai/", model: "gemini-2.5-flash" },
            { name: "groq", baseURL: "https://api.groq.com/openai/v1", model: "llama-3.3-70b-versatile" },
            { name: "cerebras", baseURL: "https://api.cerebras.ai/v1", model: "llama3.1-70b" },
            { name: "nvidia", baseURL: "https://integrate.api.nvidia.com/v1", model: "meta/llama-3.1-70b-instruct" }
        ];

        for (const cfg of configs) {
            const prefix = `${cfg.name.toUpperCase()}_API_KEY`;
            for (let i = 1; i <= 20; i++) {
                const key = process.env[`${prefix}_${i}`] || (i === 1 ? process.env[prefix] : null);
                if (key) {
                    this.workers.push({
                        id: `${cfg.name}:${i}`,
                        provider: cfg.name,
                        model: cfg.model,
                        baseURL: cfg.baseURL,
                        apiKey: key,
                        isBusy: false,
                        cooldownUntil: 0,
                        currentCooldownMultiplier: 1,
                    });
                }
            }
        }
    }

    public async execute(prompt: string) {
        const now = Date.now();
        const worker = this.workers.find(w => !w.isBusy && w.cooldownUntil <= now);
        if (!worker) throw new Error("Saturation: All workers cooling down.");

        worker.isBusy = true;
        try {
            const client = new OpenAI({ baseURL: worker.baseURL, apiKey: worker.apiKey });
            const response = await client.chat.completions.create({
                model: worker.model,
                messages: [{ role: "user", content: prompt }],
                temperature: 0.3,
            });
            worker.currentCooldownMultiplier = 1;
            return { text: response.choices[0].message.content, provider: worker.provider };
        } catch (e: any) {
            if (e.status === 429) worker.currentCooldownMultiplier = Math.min(worker.currentCooldownMultiplier * 2, 8);
            throw e;
        } finally {
            worker.isBusy = false;
            worker.cooldownUntil = Date.now() + (COOLDOWNS[worker.provider] || 1000) * worker.currentCooldownMultiplier;
        }
    }
}
