import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';

// Force dotenv to load from the correct path if not already loaded
dotenv.config({ path: path.join(process.cwd(), '.env'), override: true });

const DATA_DIR = path.join(process.cwd(), 'data');
const QUESTIONS_FILE = path.join(DATA_DIR, 'trivia_questions.json');

interface TriviaQuestion {
    q: string;
    a: string[];
    correct: number;
    category: string;
    difficulty: 'Easy' | 'Medium' | 'Hard';
}

export async function generateTriviaQuestions(category: string = 'General', count: number = 10): Promise<TriviaQuestion[]> {
    const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
    if (!GEMINI_API_KEY) {
        console.error('Missing GEMINI_API_KEY for trivia generation.');
        return [];
    }

    const prompt = `Generate ${count} unique, high-quality trivia questions for a party game in the category "${category}". 
    Format the response as a valid JSON array of objects. 
    Each object must have:
    - "q": The question string.
    - "a": An array of 4 multiple-choice answers.
    - "correct": The index (0-3) of the correct answer.
    - "category": "${category}".
    - "difficulty": One of "Easy", "Medium", "Hard".

    Ensure the questions are engaging, accurate, and diverse. Do not include markdown formatting or extra text, just the raw JSON.`;

    try {
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${GEMINI_API_KEY}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contents: [{
                    parts: [{ text: prompt }]
                }]
            })
        });

        if (!response.ok) {
            const err = await response.text();
            console.error(`Gemini API Error (${response.status}):`, err);
            return [];
        }

        const data = await response.json();
        const text = data.candidates?.[0]?.content?.parts?.[0]?.text;

        if (!text) {
            console.error('Gemini candidates empty or missing text.');
            return [];
        }

        // Strip markdown if present
        const jsonText = text.replace(/```json|```/g, '').trim();
        const questions: TriviaQuestion[] = JSON.parse(jsonText);

        return questions;
    } catch (error) {
        console.error('Error in generateTriviaQuestions:', error);
        return [];
    }
}

export function saveQuestions(newQuestions: TriviaQuestion[]) {
    if (!fs.existsSync(DATA_DIR)) {
        fs.mkdirSync(DATA_DIR, { recursive: true });
    }

    let existing: TriviaQuestion[] = [];
    if (fs.existsSync(QUESTIONS_FILE)) {
        try {
            existing = JSON.parse(fs.readFileSync(QUESTIONS_FILE, 'utf8'));
        } catch (e) {
            existing = [];
        }
    }

    // Filter out duplicates based on question text
    const existingTexts = new Set(existing.map(q => q.q.toLowerCase().trim()));
    const uniqueNew = newQuestions.filter(q => !existingTexts.has(q.q.toLowerCase().trim()));

    if (uniqueNew.length === 0) return;

    const total = [...existing, ...uniqueNew];
    fs.writeFileSync(QUESTIONS_FILE, JSON.stringify(total, null, 2));
    console.log(`Saved ${uniqueNew.length} new questions. Total: ${total.length}`);
}
