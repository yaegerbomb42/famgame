import { GoogleGenAI, Type } from '@google/genai';
import dotenv from 'dotenv';
dotenv.config();

const genai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export interface GeneratedRound {
    type: 'TRIVIA' | 'PROMPT';
    prompt: string;
    answers?: string[]; // Only for TRIVIA (must be exactly 4)
    correctIndex?: number; // Only for TRIVIA (0-3)
}

export interface GeneratedMeshupGame {
    title: string;
    tagline: string;
    rounds: GeneratedRound[];
}

export async function generateMashupGame(ideas: string[]): Promise<GeneratedMeshupGame | null> {
    try {
        const uniqueIdeas = Array.from(new Set(ideas)).filter(Boolean);
        const promptText = `
You are a chaotic, hilarious game show host AI.
The players have submitted the following ideas/topics for a mini-game:
[${uniqueIdeas.join(', ')}]

Create a 3-round mini-game that mashes these concepts together in a funny way.
The rounds can jump between topics or merge them (e.g., if topics are "pirates" and "math", a question could be "What is the square root of a doubloon?").

RULES:
- Generate EXACTLY 3 rounds.
- Each round must be EITHER 'TRIVIA' or 'PROMPT'.
- For TRIVIA: Provide a question ('prompt'), exactly 4 'answers', and the 'correctIndex' (0-3). Make the wrong answers funny.
- For PROMPT: Provide an open-ended scenario/fill-in-the-blank ('prompt') where players will type their own funny response. No 'answers' or 'correctIndex'.
- Keep it highly engaging, slightly snarky, and very creative.
        `.trim();

        const response = await genai.models.generateContent({
            model: 'gemini-2.0-flash',
            contents: promptText,
            config: {
                responseMimeType: 'application/json',
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        title: { type: Type.STRING, description: "A catchy, chaotic title for the game" },
                        tagline: { type: Type.STRING, description: "A short, funny subtitle" },
                        rounds: {
                            type: Type.ARRAY,
                            items: {
                                type: Type.OBJECT,
                                properties: {
                                    type: { type: Type.STRING, enum: ['TRIVIA', 'PROMPT'] },
                                    prompt: { type: Type.STRING, description: "The trivia question or the fill-in-the-blank prompt" },
                                    answers: {
                                        type: Type.ARRAY,
                                        items: { type: Type.STRING },
                                        description: "Exactly 4 answers for TRIVIA. Leave undefined/null for PROMPT."
                                    },
                                    correctIndex: { type: Type.INTEGER, description: "0-3. Leave undefined/null for PROMPT." }
                                },
                                required: ["type", "prompt"]
                            }
                        }
                    },
                    required: ["title", "tagline", "rounds"]
                }
            }
        });

        const text = response.text;
        if (!text) return null;

        const parsed: GeneratedMeshupGame = JSON.parse(text);

        // Ensure standard constraints just in case
        if (parsed.rounds.length > 3) parsed.rounds = parsed.rounds.slice(0, 3);

        return parsed;

    } catch (error) {
        console.error("Error generating mashup game:", error);
        return null;
    }
}
