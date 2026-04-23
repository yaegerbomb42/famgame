import dotenv from 'dotenv';
import path from 'path';

// Force dotenv to load from the correct path if not already loaded
dotenv.config({ path: path.join(process.cwd(), '.env'), override: true });

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

export interface TriviaQuestion {
    q: string;
    a: string[];
    correct: number;
    category: string;
    difficulty: 'Easy' | 'Medium' | 'Hard';
}

export class AIGenerator {
    private static async callGemini(prompt: string, isJson: boolean = true): Promise<string | null> {
        if (!GEMINI_API_KEY) {
            console.error('Missing GEMINI_API_KEY for AI generation.');
            return null;
        }

        try {
            const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    contents: [{
                        parts: [{ text: prompt }]
                    }],
                    generationConfig: {
                        response_mime_type: isJson ? "application/json" : "text/plain"
                    }
                }),
                signal: AbortSignal.timeout(10000)
            });

            if (!response.ok) {
                const err = await response.text();
                console.error(`Gemini API Error (${response.status}):`, err);
                return null;
            }

            const data = await response.json();
            const text = data.candidates?.[0]?.content?.parts?.[0]?.text;

            if (!text) {
                console.error('Gemini candidates empty or missing text.');
                return null;
            }

            return text.trim();
        } catch (error) {
            console.error('Error in callGemini:', error);
            return null;
        }
    }

    public static async generateTrivia(category: string = 'General', count: number = 10): Promise<TriviaQuestion[]> {
        const prompt = `Generate ${count} unique, high-quality trivia questions for a party game in the category "${category}". 
        Format the response as a valid JSON array of objects. 
        Each object must have:
        - "q": The question string.
        - "a": An array of 4 multiple-choice answers.
        - "correct": The index (0-3) of the correct answer.
        - "category": "${category}".
        - "difficulty": One of "Easy", "Medium", "Hard".`;

        const result = await this.callGemini(prompt);
        if (!result) return [];
        try {
            return JSON.parse(result.replace(/```json|```/g, ''));
        } catch (e) {
            console.error('Failed to parse Trivia JSON:', result);
            return [];
        }
    }

    public static async generateMindMeldPrompt(): Promise<string> {
        const prompt = `Generate a single, fun, and open-ended prompt for a "Mind Meld" game where players try to think of the SAME word. 
        Example: "Name a pizza topping" or "Name something you find in a garage". 
        Respond with ONLY the string. No JSON.`;

        const result = await this.callGemini(prompt, false);
        return result || 'Name a fruit';
    }

    public static async checkSemanticSimilarity(s1: string, s2: string): Promise<number> {
        if (s1.toLowerCase() === s2.toLowerCase()) return 1.0;
        
        const prompt = `Are the following two words/phrases semantically identical or extremely close synonyms in the context of a party game? 
        Word 1: "${s1}"
        Word 2: "${s2}"
        Respond ONLY with a JSON object: {"similarity": number} where number is between 0.0 and 1.0.`;

        const result = await this.callGemini(prompt);
        if (!result) return 0;
        try {
            const data = JSON.parse(result.replace(/```json|```/g, ''));
            return data.similarity || 0;
        } catch (e) {
            return 0;
        }
    }

    public static async generateEmojiStoryPrompt(): Promise<string> {
        const prompt = `Generate a fun topic for an emoji story game (e.g. "Your morning routine", "The plot of Shrek", "A day in the life of a ninja"). 
        Respond with ONLY the string.`;

        const result = await this.callGemini(prompt, false);
        return result || 'A day at the office';
    }

    public static async judgeEmojiStory(prompt: string, stories: Record<string, string>): Promise<{winnerId: string, reason: string}> {
        const storyEntries = Object.entries(stories).map(([id, story]) => `${id}: ${story}`).join('\n');
        const judgePrompt = `In a party game, players were asked to describe "${prompt}" using ONLY emojis. 
        Here are the submissions:
        ${storyEntries}
        
        Identify the most creative, funny, or accurate story. 
        Respond ONLY with a JSON object: {"winnerId": "the_id", "reason": "short explanation"}.`;

        const result = await this.callGemini(judgePrompt);
        if (!result) return { winnerId: Object.keys(stories)[0], reason: 'Default winner' };
        try {
            return JSON.parse(result.replace(/```json|```/g, ''));
        } catch (e) {
            return { winnerId: Object.keys(stories)[0], reason: 'Error in judging' };
        }
    }

    public static async generateDrawingPrompt(): Promise<string> {
        return this.generateDrawingPrompts(1).then(p => p[0]);
    }

    public static async generateDrawingPrompts(count: number): Promise<string[]> {
        const prompt = `Generate ${count} unique, fun, and slightly challenging drawing prompts for a party game.
        Return ONLY a JSON array of strings. Example: ["A penguin riding a unicycle", "A sentient taco", "Batman eating a donut"].`;
        try {
            const res = await this.callGemini(prompt, true);
            if (!res) throw new Error('No response');
            const cleaned = res.replace(/```json|```/g, '').trim();
            const prompts = JSON.parse(cleaned);
            if (Array.isArray(prompts)) return prompts;
            return Array(count).fill("A mysterious creature");
        } catch (e) {
            console.error('Drawing Prompts error:', e);
            return Array(count).fill("A mystery object");
        }
    }

    public static async generateWordRaceCategory(): Promise<string> {
        const prompt = `Generate a single, interesting niche category for a word race (e.g. "Types of extinct animals", "80s synth-pop bands"). 
        Respond with ONLY the string.`;

        const result = await this.callGemini(prompt, false);
        return result || 'ANYTHING';
    }

    public static async generateRoastPrompt(playerName: string): Promise<string> {
        const prompt = `Generate a short, funny, and lighthearted "Roast Trait" for a person named ${playerName} (e.g. "James: Thinks mayo is too spicy"). 
        Respond with ONLY the trait.`;

        const result = await this.callGemini(prompt, false);
        return result || 'Thinks water is too spicy';
    }

    public static async generateAIMashupPrompts(count: number = 5): Promise<string[]> {
        const prompt = `Generate ${count} unique, weird, and funny mashup prompts (e.g. "A robot learning to bake", "A pirate at a tea party"). 
        Respond ONLY with a JSON array of strings.`;

        const result = await this.callGemini(prompt);
        if (!result) return ['A mysterious object'];
        try {
            return JSON.parse(result.replace(/```json|```/g, ''));
        } catch (e) {
            return ['A mysterious object'];
        }
    }

    public static async generateGlobalAverageQuestions(count: number = 3): Promise<Array<{q: string, correct: number}>> {
        const prompt = `Generate ${count} EXTREMELY OBSCURE, completely unique, and highly varied global statistic/percentage questions for a party game. 
        NEVER REPEAT questions from typical lists. Focus on bizarre, surprising, or highly specific human behaviors, nature facts, or global surveys.
        Example: "What percentage of people say they have a favorite burner on the stove?". 
        Respond ONLY with a JSON array of objects, where each object is: {"q": "string", "correct": number_between_0_and_100}.`;

        const fallback = [
            { q: 'What percentage of people talk to pets?', correct: 92 },
            { q: 'What percentage of adults sleep with a stuffed animal?', correct: 40 },
            { q: 'What percentage of people confess to snooping on their partner\'s phone?', correct: 34 }
        ].slice(0, count);

        const result = await this.callGemini(prompt);
        if (!result) return fallback;
        try {
            return JSON.parse(result.replace(/```json|```/g, ''));
        } catch (e) {
            return fallback;
        }
    }

    public static async generateRiddles(count: number = 5): Promise<Array<{riddle: string, answer: string}>> {
        const prompt = `Generate ${count} clever and engaging riddles that can be answered with a SINGLE WORD. 
        Make sure they are not overly common. 
        Example: "I speak without a mouth and hear without ears. I have no body, but I come alive with wind." -> "Echo".
        Respond ONLY with a JSON array of objects: [{"riddle": "the riddle text", "answer": "the single word answer"}].`;

        const fallback = [
            { riddle: "I speak without a mouth and hear without ears. I have no body, but I come alive with wind.", answer: "Echo" },
            { riddle: "I have keys but open no locks. I have space but no room. You can enter but not go outside.", answer: "Keyboard" },
            { riddle: "The more of this there is, the less you see. What is it?", answer: "Darkness" }
        ].slice(0, count);

        const result = await this.callGemini(prompt);
        if (!result) return fallback;
        try {
            return JSON.parse(result.replace(/```json|```/g, ''));
        } catch (e) {
            return fallback;
        }
    }

    public static async generateHotTakesPrompt(): Promise<string> {
        const prompt = `Generate a single "Hot Take" or "Spicy Opinion" prompt for a party game (e.g. "Is a hotdog a sandwich?", "Which is the superior star wars trilogy?"). 
        Respond with ONLY the string.`;

        const result = await this.callGemini(prompt, false);
        return result || 'Is a hotdog a sandwich?';
    }

    public static async generatePollPrompts(count: number = 3): Promise<string[]> {
        const prompt = `Generate ${count} unique "Who is most likely to..." poll questions for a group of friends (e.g. "Who would survive the longest in a zombie apocalypse?"). 
        Respond ONLY with a JSON array of strings.`;

        const result = await this.callGemini(prompt);
        if (!result) return ['Who has the best fashion sense?', 'Who is the funniest?', 'Who is always late?'].slice(0, count);
        try {
            return JSON.parse(result.replace(/```json|```/g, ''));
        } catch (e) {
            return ['Who has the best fashion sense?', 'Who is the funniest?', 'Who is always late?'].slice(0, count);
        }
    }

    public static async generateNarratorQuips(playerNames: string[]): Promise<Array<{text: string, mood: 'hype' | 'savage' | 'sad'}>> {
        const names = playerNames.join(', ');
        const prompt = `You are an unhinged, savage, extremely emotional, and high-energy party game host narrator. 
        The current players are: ${names}.
        Generate 10 unique, short (under 15 words) quips for the game lobby/transitions.
        Make them hilariously aggressive, deeply emotional (either crying tears of joy or screaming in disbelief), and tailor them to the specific players by name.
        At least 5 should be "savage" (roasting them hard about their gameplay, speed, or intelligence), 3 "hype" (screaming with excitement), and 2 "sad" (dramatically weeping over how bad they are).
        
        Respond ONLY with a JSON array of objects: [{"text": "quip here", "mood": "hype" | "savage" | "sad"}].`;

        const fallback: Array<{text: string, mood: 'hype' | 'savage' | 'sad'}> = [
            { text: "Someone call an ambulance, this group looks dangerous.", mood: 'hype' },
            { text: "I've seen smarter faces on a clock.", mood: 'savage' },
            { text: "I'm literally crying at how bad you all are.", mood: 'sad' }
        ];

        const result = await this.callGemini(prompt);
        if (!result) return fallback;
        try {
            return JSON.parse(result.replace(/```json|```/g, ''));
        } catch (e) {
            return fallback;
        }
    }

    public static async generateOddOneOut(count: number = 3): Promise<Array<{items: string[], correct: number, reason: string}>> {
        const prompt = `Generate ${count} unique "Odd One Out" sets for a party game. 
        Each set should have 4 items where one doesn't belong.
        Example: ["Apple", "Orange", "Banana", "Pizza"] - Correct: 3 (Pizza).
        Respond ONLY with a JSON array of objects: [{"items": ["string", "string", "string", "string"], "correct": number_between_0_and_3, "reason": "short explanation"}].`;

        const fallback = [
            { items: ["Mercury", "Mars", "Venus", "The Moon"], correct: 3, reason: "The Moon is a satellite, others are planets." },
            { items: ["Batman", "Superman", "Spider-Man", "Iron Man"], correct: 0, reason: "Batman has no superpowers." },
            { items: ["Whale", "Dolphin", "Shark", "Seal"], correct: 2, reason: "Shark is a fish, others are mammals." }
        ].slice(0, count);

        const result = await this.callGemini(prompt);
        if (!result) return fallback;
        try {
            return JSON.parse(result.replace(/```json|```/g, ''));
        } catch (e) {
            return fallback;
        }
    }
    public static async generateDynamicRoast(playerName: string, context: string, recentEvents: string[]): Promise<{text: string, mood: string}> {
        const events = recentEvents.join(', ');
        const prompt = `You are an unhinged, savage, and high-energy party game host narrator. 
        Target Player: ${playerName}
        Context: ${context}
        Recent Gameplay Events: ${events}
        
        Generate a single, short (under 15 words) roast or hype comment for this player.
        Make it hilariously aggressive, deeply emotional (screaming or weeping), and extremely specific to the player and what just happened.
        Use their name. Be savage.
        
        Respond ONLY with a JSON object: {"text": "the comment", "mood": "SAVAGE" | "HYPE" | "SAD"}.`;

        const result = await this.callGemini(prompt);
        if (!result) return { text: `Look at ${playerName} over there. Pathetic.`, mood: 'SAVAGE' };
        try {
            return JSON.parse(result.replace(/```json|```/g, ''));
        } catch (e) {
            return { text: `Look at ${playerName} over there. Pathetic.`, mood: 'SAVAGE' };
        }
    }
}
