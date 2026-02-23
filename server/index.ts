import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';

const app = express();
app.use(cors());

app.get('/', (req, res) => {
    res.send('FamGame Server is Running! 🚀');
});

const httpServer = createServer(app);
const io = new Server(httpServer, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"]
    }
});

const PORT = process.env.PORT || 3000;

// Gemini API for Mind Meld similarity checking
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

async function checkSimilarity(answer1: string, answer2: string): Promise<number> {
    try {
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contents: [{
                    parts: [{
                        text: `Rate the semantic similarity between these two answers on a scale of 0 to 1, where 1 means identical meaning and 0 means completely unrelated. Only respond with a number between 0 and 1.\n\nAnswer 1: "${answer1}"\nAnswer 2: "${answer2}"\n\nSimilarity score:`
                    }]
                }],
                generationConfig: { temperature: 0.1, maxOutputTokens: 10 }
            })
        });
        const data = await response.json();
        const text = data.candidates?.[0]?.content?.parts?.[0]?.text || '0';
        const score = parseFloat(text.match(/[\d.]+/)?.[0] || '0');
        return Math.min(1, Math.max(0, score));
    } catch (error) {
        console.error('Gemini API error:', error);
        // Fallback: simple text matching
        return answer1.toLowerCase().trim() === answer2.toLowerCase().trim() ? 1 : 0;
    }
}

// Helper: Generate random room code
function generateRoomCode(): string {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ';
    let code = '';
    for (let i = 0; i < 4; i++) {
        code += chars[Math.floor(Math.random() * chars.length)];
    }
    return code;
}

interface Player {
    id: string;
    name: string;
    avatar?: string;
    score: number;
    bannedUntil?: number;
    isHost?: boolean;
    gameVote?: string;
}

interface GameState {
    roomCode: string;
    hostId: string | null;
    players: Record<string, Player>;
    status: 'LOBBY' | 'GAME_SELECT' | 'PLAYING' | 'RESULTS';
    currentGame?: 'TRIVIA' | '2TRUTHS' | 'HOT_TAKES' | 'POLL' | 'BUZZ_IN' | 'WORD_RACE' | 'REACTION' | 'EMOJI_STORY' | 'BLUFF' | 'THIS_OR_THAT' | 'SPEED_DRAW' | 'CHAIN_REACTION' | 'MIND_MELD' | 'COMPETE' | 'BRAIN_BURST' | 'GLOBAL_AVERAGES' | 'SKILL_SHOWDOWN';
    gameData?: any;
    gameVotes: Record<string, number>;
    timer?: number;
    leaderboard: { name: string; score: number }[];
}

let gameState: GameState = {
    roomCode: generateRoomCode(),
    hostId: null,
    players: {},
    status: 'LOBBY',
    gameVotes: {},
    leaderboard: [],
};

// Timer management
let currentTimer: NodeJS.Timeout | null = null;

function startTimer(seconds: number, onComplete: () => void) {
    if (currentTimer) clearTimeout(currentTimer);
    gameState.timer = seconds;
    io.emit('gameState', gameState);

    const tick = () => {
        if (gameState.timer && gameState.timer > 0) {
            gameState.timer--;
            io.emit('timer', gameState.timer);
            if (gameState.timer > 0) {
                currentTimer = setTimeout(tick, 1000);
            } else {
                onComplete();
            }
        }
    };
    currentTimer = setTimeout(tick, 1000);
}

function updateLeaderboard() {
    gameState.leaderboard = Object.values(gameState.players)
        .map(p => ({ name: p.name, score: p.score }))
        .sort((a, b) => b.score - a.score)
        .slice(0, 10);
}

// --- CONTENT LIBRARIES ---
const TRIVIA_QUESTIONS = [
    { q: "Who is most likely to trip over nothing?", a: ["Dad", "Mom", "The Dog", "Grandma"], correct: 0 },
    { q: "What is the capital of Australia?", a: ["Sydney", "Melbourne", "Canberra", "Perth"], correct: 2 },
    { q: "Which planet is known as the Red Planet?", a: ["Venus", "Jupiter", "Mars", "Saturn"], correct: 2 },
    { q: "What does HTML stand for?", a: ["Hyper Text Markup Language", "High Tech Modern Life", "Hyperlinks and Text Markup Language", "Home Tool Markup Language"], correct: 0 },
    { q: "Where is the Eiffel Tower located?", a: ["London", "Berlin", "Paris", "Rome"], correct: 2 },
    { q: "Which is the largest ocean?", a: ["Atlantic", "Indian", "Arctic", "Pacific"], correct: 3 },
    { q: "What comes after Trillion?", a: ["Quadrillion", "Billion", "Quintillion", "Zillion"], correct: 0 },
    { q: "How many legs does a spider have?", a: ["6", "8", "10", "12"], correct: 1 },
    { q: "Which element has the chemical symbol 'O'?", a: ["Gold", "Silver", "Oxygen", "Iron"], correct: 2 },
    { q: "Who painted the Mona Lisa?", a: ["Van Gogh", "Picasso", "Da Vinci", "Michelangelo"], correct: 2 },
    { q: "What is the fastest land animal?", a: ["Cheetah", "Lion", "Horse", "Eagle"], correct: 0 },
    { q: "What year did the Titanic sink?", a: ["1912", "1905", "1920", "1899"], correct: 0 },
    { q: "Which fruit has its seeds on the outside?", a: ["Apple", "Banana", "Strawberry", "Kiwi"], correct: 2 },
    { q: "Which gas do plants absorb?", a: ["Oxygen", "Nitrogen", "Carbon Dioxide", "Helium"], correct: 2 },
    { q: "What is the hardest natural substance?", a: ["Gold", "Iron", "Diamond", "Platinum"], correct: 2 },
];

const POLL_PROMPTS = [
    "Who would survive the longest in a zombie apocalypse?",
    "Who is mostly likely to become a billionaire?",
    "Who spends the most time on their phone?",
    "Who is the worst driver?",
    "Who would accidentally join a cult?",
    "Who has the best fashion sense?",
    "Who is the clumsiest?",
    "Who talks the loudest?",
    "Who is most likely to become famous?",
    "Who gives the best advice?",
    "Who is the pickiest eater?",
    "Who would die first in a horror movie?",
    "Who is most likely to forget their own birthday?",
    "Who is the best cook?",
    "Who laughs at the worst times?",
    "Who is secretly a superhero?"
];

const WORD_RACE_CATEGORIES = [
    "Animals", "Fruits", "Countries", "Brands", "Movies", "Colors", "Sports",
    "Vegetables", "Cities", "Cars", "Body Parts", "Jobs", "Clothes",
    "Furniture", "Tools", "Instruments", "Toys", "Drinks", "Flowers"
];

// Brain Burst — Millionaire-style trivia (50 fun questions, escalating tiers)
const BRAIN_BURST_QUESTIONS = [
    // Pop Culture & General Fun (Tier 1-5)
    { q: "What is the highest grossing media franchise of all time?", a: ["Star Wars", "Marvel Cinematic Universe", "Pokemon", "Mickey Mouse"], correct: 2 },
    { q: "Which of these animals is legally allowed to be mayor of a town in the US?", a: ["A Cat", "A Dog", "A Goat", "All of the Above"], correct: 3 },
    { q: "What is the tiny piece of plastic at the end of a shoelace called?", a: ["Aglet", "Grommet", "Ferrule", "Flange"], correct: 0 },
    { q: "Which of these is NOT a real flavor of Doritos ever released?", a: ["Mountain Dew", "Clam Chowder", "Late Night Cheeseburger", "Spicy Watermelon"], correct: 3 },
    { q: "In the game Monopoly, what is the name of the mascot character?", a: ["Rich Uncle Pennybags", "Mr. Monopoly", "Milburn Pennybags", "Arthur Property"], correct: 2 },
    { q: "What is the fear of being without your mobile phone called?", a: ["Telephobia", "Phonophobia", "Nomophobia", "Cellophobia"], correct: 2 },
    { q: "Which US state's name ends in three consecutive vowels?", a: ["Hawaii", "Ohio", "Iowa", "None of them"], correct: 0 },
    { q: "What was the original color of the Statue of Liberty?", a: ["Green", "Copper", "Gold", "White"], correct: 1 },
    { q: "Which of these is a real animal?", a: ["Jackalope", "Drop Bear", "Binturong", "Snipe"], correct: 2 },
    { q: "What is the main ingredient in the popular Middle Eastern dip, hummus?", a: ["Lentils", "Black Beans", "Chickpeas", "Edamame"], correct: 2 },
    { q: "What is the only state in the US that does not participate in Daylight Saving Time across the whole state?", a: ["Arizona", "Hawaii", "Both Arizona and Hawaii", "None, they all do"], correct: 2 },
    { q: "Which planet is known as the 'Morning Star' or 'Evening Star'?", a: ["Mars", "Venus", "Mercury", "Jupiter"], correct: 1 },

    // Medium-Easy (Tier 4-6)
    { q: "What is the largest planet in our solar system?", a: ["Mars", "Saturn", "Jupiter", "Neptune"], correct: 2 },
    { q: "Which country is shaped like a boot?", a: ["France", "Spain", "Italy", "Greece"], correct: 2 },
    { q: "What is baby kangaroo called?", a: ["Cub", "Joey", "Kit", "Pup"], correct: 1 },
    { q: "How many bones does an adult human have?", a: ["106", "156", "206", "306"], correct: 2 },
    { q: "What is the hardest rock?", a: ["Granite", "Diamond", "Marble", "Quartz"], correct: 1 },
    { q: "Which ocean is the biggest?", a: ["Atlantic", "Indian", "Pacific", "Arctic"], correct: 2 },
    { q: "What gas do we breathe in?", a: ["Carbon Dioxide", "Nitrogen", "Oxygen", "Helium"], correct: 2 },
    { q: "How many continents are there?", a: ["5", "6", "7", "8"], correct: 2 },
    { q: "What is the tallest animal?", a: ["Elephant", "Giraffe", "Horse", "Camel"], correct: 1 },
    { q: "Who wrote 'Romeo and Juliet'?", a: ["Charles Dickens", "William Shakespeare", "Jane Austen", "Mark Twain"], correct: 1 },
    { q: "What do pandas eat?", a: ["Bamboo", "Fish", "Berries", "Insects"], correct: 0 },
    { q: "Which insect is known for making silk?", a: ["Spider", "Silkworm", "Beetle", "Ant"], correct: 1 },

    // Medium (Tier 7-9)
    { q: "Which planet is closest to the Sun?", a: ["Venus", "Earth", "Mercury", "Mars"], correct: 2 },
    { q: "What is the fastest bird?", a: ["Eagle", "Peregrine Falcon", "Hawk", "Ostrich"], correct: 1 },
    { q: "In which city is the Eiffel Tower?", a: ["London", "Rome", "Berlin", "Paris"], correct: 3 },
    { q: "What is a group of lions called?", a: ["Pack", "Herd", "Pride", "Flock"], correct: 2 },
    { q: "How many Harry Potter books are there?", a: ["5", "6", "7", "8"], correct: 2 },
    { q: "What is sushi traditionally wrapped in?", a: ["Lettuce", "Seaweed", "Rice Paper", "Tortilla"], correct: 1 },
    { q: "Which superhero is from Wakanda?", a: ["Iron Man", "Black Panther", "Spider-Man", "Thor"], correct: 1 },
    { q: "What is the currency of Japan?", a: ["Won", "Yuan", "Yen", "Dollar"], correct: 2 },
    { q: "How many teeth does an adult human normally have?", a: ["28", "30", "32", "36"], correct: 2 },
    { q: "What is the world's largest desert?", a: ["Sahara", "Gobi", "Antarctic", "Arabian"], correct: 2 },
    { q: "Which artist painted the Mona Lisa?", a: ["Michelangelo", "Vincent van Gogh", "Leonardo da Vinci", "Pablo Picasso"], correct: 2 },
    { q: "What is the rarest blood type?", a: ["O-", "B-", "AB-", "A-"], correct: 2 },

    // Medium-Hard (Tier 10-12)
    { q: "What year did the first iPhone come out?", a: ["2005", "2006", "2007", "2008"], correct: 2 },
    { q: "Which country has the most people?", a: ["USA", "India", "China", "Indonesia"], correct: 1 },
    { q: "What is the smallest country in the world?", a: ["Monaco", "Vatican City", "Nauru", "Malta"], correct: 1 },
    { q: "How many rings are on the Olympic flag?", a: ["3", "4", "5", "6"], correct: 2 },
    { q: "What element does 'Au' represent?", a: ["Silver", "Aluminum", "Gold", "Argon"], correct: 2 },
    { q: "Which animal can sleep for 3 years?", a: ["Sloth", "Snail", "Bear", "Koala"], correct: 1 },
    { q: "What is the longest river in the world?", a: ["Amazon", "Nile", "Mississippi", "Yangtze"], correct: 1 },
    { q: "What does DNA stand for?", a: ["Deoxyribonucleic Acid", "Dioxin Natural Acid", "Dynamic Neural Acid", "Digital Network Array"], correct: 0 },
    { q: "Which planet has the most moons?", a: ["Jupiter", "Saturn", "Uranus", "Neptune"], correct: 1 },
    { q: "What is the national animal of Scotland?", a: ["Dragon", "Lion", "Unicorn", "Griffin"], correct: 2 },
    { q: "What is the only mammal capable of sustained flight?", a: ["Flying Squirrel", "Bat", "Lemur", "Sugar Glider"], correct: 1 },
    { q: "What temperature does water boil at in Fahrenheit?", a: ["100", "150", "212", "300"], correct: 2 },

    // Hard (Tier 13-15)
    { q: "What is a group of flamingos called?", a: ["Flock", "Flamboyance", "Colony", "Brigade"], correct: 1 },
    { q: "Which fruit has the most seeds?", a: ["Watermelon", "Pomegranate", "Strawberry", "Kiwi"], correct: 2 },
    { q: "What color are aircraft black boxes?", a: ["Black", "Orange", "Yellow", "Red"], correct: 1 },
    { q: "How long is a goldfish's memory?", a: ["3 seconds", "Months", "1 minute", "1 hour"], correct: 1 },
    { q: "Which country invented ice cream?", a: ["Italy", "France", "China", "USA"], correct: 2 },
    { q: "What is the fear of long words called?", a: ["Logophobia", "Hippopotomonstrosesquipedaliophobia", "Sesquiphobia", "Verbophobia"], correct: 1 },
    { q: "How many hearts does an octopus have?", a: ["1", "2", "3", "4"], correct: 2 },
    { q: "What was the first toy advertised on TV?", a: ["Barbie", "Mr. Potato Head", "Slinky", "LEGO"], correct: 1 },
    { q: "Which Disney princess has a raccoon friend?", a: ["Rapunzel", "Pocahontas", "Moana", "Mulan"], correct: 1 },
    { q: "What is the most stolen food in the world?", a: ["Candy", "Bread", "Cheese", "Meat"], correct: 2 },
    { q: "How many times does the heart beat per day on average?", a: ["10,000", "50,000", "100,000", "500,000"], correct: 2 },
    { q: "What geometric shape is generally used for stop signs?", a: ["Hexagon", "Octagon", "Decagon", "Pentagon"], correct: 1 },
    { q: "What is the only metal that is liquid at room temperature?", a: ["Lead", "Iron", "Zinc", "Mercury"], correct: 3 },
    { q: "What was the first feature-length animated movie ever released?", a: ["Fantasia", "Bambi", "Snow White", "Pinocchio"], correct: 2 },

    // Extreme (Tier 16-18)
    { q: "What is the capital city of Mongolia?", a: ["Ulaanbaatar", "Astana", "Tashkent", "Bishkek"], correct: 0 },
    { q: "What is the rarest naturally occurring element on Earth?", a: ["Astatine", "Francium", "Promethium", "Technetium"], correct: 0 },
    { q: "Who was the Byzantine Emperor during the Nika Riots?", a: ["Justinian I", "Constantine the Great", "Heraclius", "Basil II"], correct: 0 },
    { q: "What is the heaviest naturally occurring element by atomic weight?", a: ["Uranium", "Plutonium", "Thorium", "Lead"], correct: 0 },
    { q: "In Greek mythology, who was the muse of history?", a: ["Clio", "Calliope", "Thalia", "Melpomene"], correct: 0 },
    { q: "Which composer wrote the 'Moonlight Sonata'?", a: ["Ludwig van Beethoven", "Wolfgang Amadeus Mozart", "Johann Sebastian Bach", "Frédéric Chopin"], correct: 0 },
    { q: "What is the main language spoken in Andorra?", a: ["Catalan", "Spanish", "French", "Andorran"], correct: 0 },
    { q: "Who discovered the neutron?", a: ["James Chadwick", "Niels Bohr", "Ernest Rutherford", "J.J. Thomson"], correct: 0 },
    { q: "What is the longest bone in the human body?", a: ["Femur", "Tibia", "Fibula", "Humerus"], correct: 0 },
    { q: "Which pharaoh's tomb was discovered by Howard Carter in 1922?", a: ["Tutankhamun", "Ramses II", "Khufu", "Akhenaten"], correct: 0 },

    // Master (Tier 19-21)
    { q: "What is the deepest known point in the Earth's oceans?", a: ["Mariana Trench", "Tonga Trench", "Philippine Trench", "Kermadec Trench"], correct: 0 },
    { q: "What is the only even prime number?", a: ["2", "4", "6", "8"], correct: 0 },
    { q: "Who authored the philosophical work 'Critique of Pure Reason'?", a: ["Immanuel Kant", "Friedrich Nietzsche", "Rene Descartes", "John Locke"], correct: 0 },
    { q: "What is the chemical symbol for Tungsten?", a: ["W", "Tu", "Tn", "Tg"], correct: 0 },
    { q: "What year did the Ottoman Empire officially end?", a: ["1922", "1918", "1920", "1925"], correct: 0 },
    { q: "Who is the longest-reigning monarch in world history (verifiable)?", a: ["Louis XIV of France", "Queen Elizabeth II", "King Bhumibol Adulyadej", "Emperor Franz Joseph I"], correct: 0 },
    { q: "Which planet in our solar system has the shortest day?", a: ["Jupiter", "Saturn", "Neptune", "Uranus"], correct: 0 },
    { q: "What is the highest grossing movie of all time (as of 2024 unadjusted)?", a: ["Avatar", "Avengers: Endgame", "Titanic", "Star Wars: The Force Awakens"], correct: 0 },
    { q: "Who was the first woman to win a Nobel Prize?", a: ["Marie Curie", "Rosalind Franklin", "Ada Lovelace", "Jane Goodall"], correct: 0 },
    { q: "What is the smallest bone in the human body?", a: ["Stapes", "Incus", "Malleus", "Pisiform"], correct: 0 },

    // Grandmaster (Tier 22-25)
    { q: "What is the most abundant gas in the Earth's atmosphere?", a: ["Nitrogen", "Oxygen", "Argon", "Carbon Dioxide"], correct: 0 },
    { q: "Who painted 'The Persistence of Memory'?", a: ["Salvador Dalí", "Pablo Picasso", "Vincent van Gogh", "Claude Monet"], correct: 0 },
    { q: "What is the capital of Burkina Faso?", a: ["Ouagadougou", "Bamako", "Niamey", "Dakar"], correct: 0 },
    { q: "Which element has the highest melting point?", a: ["Tungsten", "Carbon", "Rhenium", "Osmium"], correct: 0 },
    { q: "Who was the first Roman Emperor?", a: ["Augustus", "Julius Caesar", "Nero", "Caligula"], correct: 0 },
    { q: "What is the name of the largest moon of Saturn?", a: ["Titan", "Enceladus", "Europa", "Ganymede"], correct: 0 },
    { q: "In what year was the Magna Carta signed?", a: ["1215", "1066", "1314", "1415"], correct: 0 },
    { q: "What is the hardest natural substance known?", a: ["Lonsdaleite", "Diamond", "Wurtzite Boron Nitride", "Graphene"], correct: 1 },
    { q: "Who wrote 'One Hundred Years of Solitude'?", a: ["Gabriel García Márquez", "Jorge Luis Borges", "Julio Cortázar", "Mario Vargas Llosa"], correct: 0 },
    { q: "What is the speed of light in a vacuum (approx)?", a: ["299,792 km/s", "300,000 km/s", "290,000 km/s", "310,000 km/s"], correct: 0 },

    // Demigod (Adding buffer for Random Shuffle length)
    { q: "What is the name of the first artificial Earth satellite?", a: ["Sputnik 1", "Explorer 1", "Vanguard 1", "Luna 1"], correct: 0 },
    { q: "Who discovered penicillin?", a: ["Alexander Fleming", "Louis Pasteur", "Joseph Lister", "Robert Koch"], correct: 0 },
    { q: "What is the largest organ in the human body?", a: ["Skin", "Liver", "Brain", "Heart"], correct: 0 },
    { q: "Which animal has the largest brain relative to its body size?", a: ["Sperm Whale", "Dolphin", "Human", "Elephant"], correct: 0 },
    { q: "What is the boiling point of liquid nitrogen?", a: ["-196 °C", "-273 °C", "-100 °C", "-50 °C"], correct: 0 },
    { q: "Who was the first human to journey into outer space?", a: ["Yuri Gagarin", "Neil Armstrong", "Buzz Aldrin", "Alan Shepard"], correct: 0 },
    { q: "What is the most spoken language of the world?", a: ["Mandarin Chinese", "English", "Spanish", "Hindi"], correct: 1 },
    { q: "Which country is the largest in the world by land area?", a: ["Russia", "Canada", "China", "USA"], correct: 0 },
    { q: "What is the highest mountain in the world?", a: ["Mount Everest", "K2", "Kangchenjunga", "Lhotse"], correct: 0 },
    { q: "Who is known as the 'Father of Computer Science'?", a: ["Alan Turing", "Charles Babbage", "John von Neumann", "Ada Lovelace"], correct: 0 },

    // Mythological & Legendary (Buffer for 35)
    { q: "What is the name of King Arthur's sword?", a: ["Excalibur", "Caliburn", "Durandal", "Joyeuse"], correct: 0 },
    { q: "Who was the Greek god of the underworld?", a: ["Zeus", "Poseidon", "Ares", "Hades"], correct: 3 },
    { q: "What creature has the head of an eagle and the body of a lion?", a: ["Griffin", "Chimera", "Manticore", "Sphinx"], correct: 0 },
    { q: "Who was the Norse god of thunder?", a: ["Odin", "Loki", "Thor", "Tyr"], correct: 2 },
    { q: "What is the Japanese equivalent of a dragon called?", a: ["Ryu", "Kappa", "Oni", "Kitsune"], correct: 0 },
    { q: "What legendary city is said to be lost underwater?", a: ["El Dorado", "Atlantis", "Shangri-La", "Camelot"], correct: 1 },
    { q: "Who was the Roman goddess of love and beauty?", a: ["Juno", "Minerva", "Venus", "Diana"], correct: 2 },
    { q: "What mythical creature rises from its own ashes?", a: ["Dragon", "Phoenix", "Pegasus", "Unicorn"], correct: 1 },
    { q: "Who was the hero of the epic poem 'The Odyssey'?", a: ["Achilles", "Hector", "Aeneas", "Odysseus"], correct: 3 },
    { q: "What monster did Perseus defeat using a mirrored shield?", a: ["Chimera", "Minotaur", "Medusa", "Hydra"], correct: 2 },
];

const BRAIN_BURST_TIERS = [
    { level: 1, prize: '$100', points: 100 },
    { level: 2, prize: '$200', points: 200 },
    { level: 3, prize: '$300', points: 300 },
    { level: 4, prize: '$500', points: 500 },
    { level: 5, prize: '$1,000', points: 1000 },
    { level: 6, prize: '$2,000', points: 2000 },
    { level: 7, prize: '$4,000', points: 4000 },
    { level: 8, prize: '$8,000', points: 8000 },
    { level: 9, prize: '$16,000', points: 16000 },
    { level: 10, prize: '$32,000', points: 32000 },
    { level: 11, prize: '$64,000', points: 64000 },
    { level: 12, prize: '$125,000', points: 125000 },
    { level: 13, prize: '$250,000', points: 250000 },
    { level: 14, prize: '$500,000', points: 500000 },
    { level: 15, prize: '$1,000,000', points: 1000000 },
    { level: 16, prize: '$2,500,000', points: 2500000 },
    { level: 17, prize: '$5,000,000', points: 5000000 },
    { level: 18, prize: '$10,000,000', points: 10000000 },
    { level: 19, prize: '$25,000,000', points: 25000000 },
    { level: 20, prize: '$50,000,000', points: 50000000 },
    { level: 21, prize: '$100,000,000', points: 100000000 },
    { level: 22, prize: '$250,000,000', points: 250000000 },
    { level: 23, prize: '$500,000,000', points: 500000000 },
    { level: 24, prize: '$750,000,000', points: 750000000 },
    { level: 25, prize: '$1,000,000,000', points: 1000000000 },
    { level: 26, prize: '$1,250,000,000', points: 1250000000 },
    { level: 27, prize: '$1,500,000,000', points: 1500000000 },
    { level: 28, prize: '$2,000,000,000', points: 2000000000 },
    { level: 29, prize: '$3,000,000,000', points: 3000000000 },
    { level: 30, prize: '$4,000,000,000', points: 4000000000 },
    { level: 31, prize: '$5,000,000,000', points: 5000000000 },
    { level: 32, prize: '$6,000,000,000', points: 6000000000 },
    { level: 33, prize: '$7,500,000,000', points: 7500000000 },
    { level: 34, prize: '$8,500,000,000', points: 8500000000 },
    { level: 35, prize: '$10,000,000,000', points: 10000000000 },
];

const GLOBAL_AVERAGES_QUESTIONS = [
    { q: "What percentage of the world's population is left-handed?", correct: 10 },
    { q: "What percentage of people have never seen snow in real life?", correct: 50 },
    { q: "What percentage of the human body is made of water?", correct: 60 },
    { q: "What percentage of people admit to checking their phones on the toilet?", correct: 75 },
    { q: "What percentage of people can roll their tongues?", correct: 70 },
    { q: "What percentage of the world's surface is covered by water?", correct: 71 },
    { q: "What percentage of people have brown eyes?", correct: 79 },
    { q: "What percentage of New Year's resolutions fail by February?", correct: 80 },
    { q: "What percentage of communication is non-verbal?", correct: 93 },
    { q: "What percentage of Americans drink coffee daily?", correct: 62 },
    { q: "What percentage of the world's population lives in the Northern Hemisphere?", correct: 90 },
    { q: "What percentage of DNA do humans share with chimpanzees?", correct: 98 },
    { q: "What percentage of the universe is made up of dark energy?", correct: 68 },
    { q: "What percentage of adults sleep with a stuffed animal?", correct: 40 },
    { q: "What percentage of start-up businesses fail within the first year?", correct: 20 },
    { q: "What percentage of people have a fear of public speaking?", correct: 75 },
    { q: "What percentage of people own a smartphone globally?", correct: 85 },
    { q: "What percentage of the brain is water?", correct: 73 },
    { q: "What percentage of millionaires are self-made?", correct: 80 },
    { q: "What percentage of people snooze their alarms at least once?", correct: 57 }
];

const revealGlobalAveragesLogic = () => {
    if (gameState.currentGame !== 'GLOBAL_AVERAGES' || gameState.gameData?.phase !== 'WAITING') return;

    gameState.gameData.phase = 'REVEAL';

    const correct = gameState.gameData.correct;
    const differences = Object.entries(gameState.gameData.guesses).map(([pid, guess]: [string, any]) => ({
        pid, diff: Math.abs(guess - correct)
    }));

    // Sort by closest to correct answer
    differences.sort((a, b) => a.diff - b.diff);

    const pointsDistribution = [200, 150, 100, 50]; // 1st, 2nd, 3rd, 4th place
    differences.forEach((result, idx) => {
        const pts = pointsDistribution[idx] || 10;
        if (gameState.players[result.pid]) {
            gameState.players[result.pid].score += pts;
        }
        if (idx === 0) {
            gameState.gameData.closestPid = result.pid;
            gameState.gameData.pointsAwarded = pts;
        }
    });

    updateLeaderboard();
    io.emit('gameState', gameState);

    // Auto-Next Timer (10 Seconds total)
    setTimeout(() => {
        if (gameState.currentGame === 'GLOBAL_AVERAGES' && gameState.gameData?.phase === 'REVEAL') {
            if (gameState.gameData.round < 5) {
                // Next Round Routine
                const question = GLOBAL_AVERAGES_QUESTIONS[Math.floor(Math.random() * GLOBAL_AVERAGES_QUESTIONS.length)];
                gameState.gameData = {
                    phase: 'WAITING',
                    round: gameState.gameData.round + 1,
                    question: question.q,
                    correct: question.correct,
                    guesses: {},
                };
                io.emit('gameState', gameState);

                // Auto-Reveal Timer for the new round
                const currentRound = gameState.gameData.round;
                setTimeout(() => {
                    if (gameState.currentGame === 'GLOBAL_AVERAGES' && gameState.gameData?.phase === 'WAITING' && gameState.gameData?.round === currentRound) {
                        revealGlobalAveragesLogic();
                    }
                }, 20000);
            } else {
                // Chain into Skill Showdown instead of RESULTS
                gameState.currentGame = 'SKILL_SHOWDOWN';
                startSkillShowdown();
            }
        }
    }, 10000);
};

// --- SKILL SHOWDOWN CHALLENGE DEFINITIONS ---
const SKILL_SHOWDOWN_CHALLENGES = [
    { type: 'CIRCLE_DRAW', title: '🎯 Perfect Circle', instruction: 'Draw the most perfect circle you can!', timeLimit: 10 },
    { type: 'MEMORY_GRID', title: '🧠 Memory Grid', instruction: 'Memorize the pattern, then recreate it!', timeLimit: 12, gridSize: 4, litCount: 6 },
    { type: 'TEMPO_TAP', title: '⏱️ Tempo Tap', instruction: 'Tap to the beat! Keep a steady rhythm.', timeLimit: 10, targetBPM: 120 },
    { type: 'COLOR_MATCH', title: '🎨 Color Match', instruction: 'Match the target color as closely as possible!', timeLimit: 10 },
    { type: 'ANGLE_GUESS', title: '📐 Angle Guess', instruction: 'Estimate the angle shown on screen!', timeLimit: 8 },
];

const startSkillShowdown = () => {
    const challenge = SKILL_SHOWDOWN_CHALLENGES[0];
    let challengeData: any = { ...challenge };

    // Generate challenge-specific data
    if (challenge.type === 'MEMORY_GRID') {
        const grid = Array(16).fill(false);
        const indices: number[] = [];
        while (indices.length < (challenge.litCount || 6)) {
            const idx = Math.floor(Math.random() * 16);
            if (!indices.includes(idx)) { indices.push(idx); grid[idx] = true; }
        }
        challengeData.grid = grid;
    } else if (challenge.type === 'COLOR_MATCH') {
        challengeData.targetColor = {
            r: Math.floor(Math.random() * 200) + 30,
            g: Math.floor(Math.random() * 200) + 30,
            b: Math.floor(Math.random() * 200) + 30,
        };
    } else if (challenge.type === 'ANGLE_GUESS') {
        challengeData.targetAngle = Math.floor(Math.random() * 340) + 10; // 10-350 degrees
    }

    gameState.gameData = {
        phase: 'PREVIEW',
        challengeIndex: 0,
        challenge: challengeData,
        submissions: {},
        scores: {},
    };
    io.emit('gameState', gameState);

    // After 3s preview, switch to PLAYING
    setTimeout(() => {
        if (gameState.currentGame === 'SKILL_SHOWDOWN' && gameState.gameData?.phase === 'PREVIEW' && gameState.gameData?.challengeIndex === 0) {
            gameState.gameData.phase = 'PLAYING';
            io.emit('gameState', gameState);

            // Auto-close after timeLimit
            setTimeout(() => {
                if (gameState.currentGame === 'SKILL_SHOWDOWN' && gameState.gameData?.phase === 'PLAYING' && gameState.gameData?.challengeIndex === 0) {
                    scoreAndRevealSkillShowdown();
                }
            }, (challengeData.timeLimit || 10) * 1000);
        }
    }, 3000);
};

const scoreAndRevealSkillShowdown = () => {
    if (gameState.currentGame !== 'SKILL_SHOWDOWN' || gameState.gameData?.phase !== 'PLAYING') return;

    gameState.gameData.phase = 'REVEAL';
    const challenge = gameState.gameData.challenge;
    const submissions = gameState.gameData.submissions;

    // Score each player based on challenge type
    const playerScores: Record<string, number> = {};

    Object.entries(submissions).forEach(([pid, data]: [string, any]) => {
        let score = 0;
        switch (challenge.type) {
            case 'CIRCLE_DRAW': {
                // Score is the circularity value (0-100) sent by the client
                score = Math.round(Math.max(0, Math.min(100, data.circularity || 0)));
                break;
            }
            case 'MEMORY_GRID': {
                // Score = number of correct tiles out of gridSize^2
                const correct = challenge.grid;
                const player = data.grid || [];
                let matches = 0;
                for (let i = 0; i < 16; i++) {
                    if (correct[i] === (player[i] || false)) matches++;
                }
                score = Math.round((matches / 16) * 100);
                break;
            }
            case 'TEMPO_TAP': {
                // Score = consistency (0-100) from client
                score = Math.round(Math.max(0, Math.min(100, data.consistency || 0)));
                break;
            }
            case 'COLOR_MATCH': {
                // Score = inverse color distance
                const target = challenge.targetColor;
                const submitted = data.color || { r: 0, g: 0, b: 0 };
                const dist = Math.sqrt(
                    Math.pow(target.r - submitted.r, 2) +
                    Math.pow(target.g - submitted.g, 2) +
                    Math.pow(target.b - submitted.b, 2)
                );
                const maxDist = Math.sqrt(255 * 255 * 3); // ~441
                score = Math.round(Math.max(0, (1 - dist / maxDist) * 100));
                break;
            }
            case 'ANGLE_GUESS': {
                // Score = inverse of angle difference
                const diff = Math.abs(data.angle - challenge.targetAngle);
                score = Math.round(Math.max(0, 100 - diff));
                break;
            }
        }
        playerScores[pid] = score;
    });

    // Sort and award points (top gets 300, 2nd 200, 3rd 100, rest 50)
    const sorted = Object.entries(playerScores).sort((a, b) => b[1] - a[1]);
    const pointTiers = [300, 200, 100, 50];
    sorted.forEach(([pid, rawScore], idx) => {
        const pts = pointTiers[idx] || 25;
        if (gameState.players[pid]) {
            gameState.players[pid].score += pts;
        }
    });
    gameState.gameData.scores = playerScores;

    updateLeaderboard();
    io.emit('gameState', gameState);

    // After 6s reveal, advance to next challenge or end
    setTimeout(() => {
        if (gameState.currentGame === 'SKILL_SHOWDOWN' && gameState.gameData?.phase === 'REVEAL') {
            advanceSkillShowdown();
        }
    }, 6000);
};

const advanceSkillShowdown = () => {
    const nextIdx = gameState.gameData.challengeIndex + 1;
    if (nextIdx >= SKILL_SHOWDOWN_CHALLENGES.length) {
        // All challenges done → RESULTS
        gameState.status = 'RESULTS';
        updateLeaderboard();
        io.emit('gameState', gameState);
        return;
    }

    const challenge = SKILL_SHOWDOWN_CHALLENGES[nextIdx];
    let challengeData: any = { ...challenge };

    // Generate challenge-specific data
    if (challenge.type === 'MEMORY_GRID') {
        const grid = Array(16).fill(false);
        const indices: number[] = [];
        while (indices.length < (challenge.litCount || 6)) {
            const idx = Math.floor(Math.random() * 16);
            if (!indices.includes(idx)) { indices.push(idx); grid[idx] = true; }
        }
        challengeData.grid = grid;
    } else if (challenge.type === 'COLOR_MATCH') {
        challengeData.targetColor = {
            r: Math.floor(Math.random() * 200) + 30,
            g: Math.floor(Math.random() * 200) + 30,
            b: Math.floor(Math.random() * 200) + 30,
        };
    } else if (challenge.type === 'ANGLE_GUESS') {
        challengeData.targetAngle = Math.floor(Math.random() * 340) + 10;
    }

    gameState.gameData = {
        phase: 'PREVIEW',
        challengeIndex: nextIdx,
        challenge: challengeData,
        submissions: {},
        scores: {},
    };
    io.emit('gameState', gameState);

    // After 3s preview, switch to PLAYING
    setTimeout(() => {
        if (gameState.currentGame === 'SKILL_SHOWDOWN' && gameState.gameData?.phase === 'PREVIEW' && gameState.gameData?.challengeIndex === nextIdx) {
            gameState.gameData.phase = 'PLAYING';
            io.emit('gameState', gameState);

            // Auto-close after timeLimit
            setTimeout(() => {
                if (gameState.currentGame === 'SKILL_SHOWDOWN' && gameState.gameData?.phase === 'PLAYING' && gameState.gameData?.challengeIndex === nextIdx) {
                    scoreAndRevealSkillShowdown();
                }
            }, (challengeData.timeLimit || 10) * 1000);
        }
    }, 3000);
};

const startGlobalAveragesRound = (roundNum: number) => {
    const question = GLOBAL_AVERAGES_QUESTIONS[Math.floor(Math.random() * GLOBAL_AVERAGES_QUESTIONS.length)];
    gameState.gameData = {
        phase: 'WAITING',
        round: roundNum,
        question: question.q,
        correct: question.correct,
        guesses: {},
    };
    io.emit('gameState', gameState);

    // Auto-Reveal Timer (20 Seconds)
    setTimeout(() => {
        if (gameState.currentGame === 'GLOBAL_AVERAGES' && gameState.gameData?.phase === 'WAITING' && gameState.gameData?.round === roundNum) {
            revealGlobalAveragesLogic();
        }
    }, 20000);
};

io.on('connection', (socket: any) => {
    console.log('Client connected:', socket.id);

    socket.emit('gameState', gameState);

    // CREATE ROOM (Host)
    socket.on('createRoom', ({ name }: { name: string }) => {
        gameState.roomCode = generateRoomCode();
        gameState.hostId = socket.id;
        gameState.players = {};
        gameState.players[socket.id] = {
            id: socket.id,
            name: name || 'Host',
            avatar: '📺',
            score: 0,
            isHost: true
        };
        gameState.status = 'LOBBY';
        gameState.gameVotes = {};
        io.emit('gameState', gameState);
    });

    socket.on('joinRoom', ({ name, code, avatar }: { name: string, code: string, avatar?: string }) => {
        if (code.toUpperCase() !== gameState.roomCode) {
            socket.emit('error', { message: 'Invalid room code' });
            return;
        }
        gameState.players[socket.id] = {
            id: socket.id,
            name: name || `Player ${Object.keys(gameState.players).length + 1}`,
            avatar: avatar || '🙂',
            score: 0,
            isHost: false
        };
        io.emit('gameState', gameState);
    });

    // KICK PLAYER (Host only)
    socket.on('kickPlayer', (playerId: string) => {
        if (socket.id === gameState.hostId && gameState.players[playerId]) {
            delete gameState.players[playerId];
            io.to(playerId).emit('kicked');
            io.emit('gameState', gameState);
        }
    });

    // LEAVE ROOM
    socket.on('leaveRoom', () => {
        delete gameState.players[socket.id];
        if (socket.id === gameState.hostId) {
            // Reset room if host leaves
            gameState = {
                roomCode: generateRoomCode(),
                hostId: null,
                players: {},
                status: 'LOBBY',
                gameVotes: {},
                leaderboard: [],
            };
        }
        io.emit('gameState', gameState);
    });

    // VOTE FOR GAME (Players)
    socket.on('voteGame', (gameId: string) => {
        if (gameState.players[socket.id]) {
            gameState.players[socket.id].gameVote = gameId;
            // Count votes
            const votes: Record<string, number> = {};
            Object.values(gameState.players).forEach(p => {
                if (p.gameVote) {
                    votes[p.gameVote] = (votes[p.gameVote] || 0) + 1;
                }
            });
            gameState.gameVotes = votes;
            io.emit('gameState', gameState);
        }
    });

    socket.on('startGame', () => {
        gameState.status = 'GAME_SELECT';
        // Clear previous votes
        Object.values(gameState.players).forEach(p => { p.gameVote = undefined; });
        gameState.gameVotes = {};
        io.emit('gameState', gameState);
    });

    // GAME SELECT
    socket.on('selectGame', (gameId: any) => {
        gameState.status = 'PLAYING';
        gameState.currentGame = gameId;

        // Reset logic
        Object.keys(gameState.players).forEach(pid => {
            gameState.players[pid].bannedUntil = 0;
        });

        if (gameId === 'TRIVIA') {
            gameState.gameData = {
                questionIndex: 0,
                question: TRIVIA_QUESTIONS[0],
                timer: 30,
                showResult: false,
                answers: {}
            };
        } else if (gameId === '2TRUTHS') {
            gameState.gameData = {
                phase: 'INPUT',
                inputs: {},
                currentSubjectId: null,
                votes: {},
                timer: 60
            };
        } else if (gameId === 'HOT_TAKES') {
            gameState.gameData = {
                phase: 'INPUT',
                prompt: "What is the worst pizza topping?",
                inputs: {},
                votes: {},
                timer: 45
            };
        } else if (gameId === 'POLL') {
            gameState.gameData = {
                phase: 'VOTING',
                prompt: POLL_PROMPTS[Math.floor(Math.random() * POLL_PROMPTS.length)],
                votes: {},
            };
        } else if (gameId === 'BUZZ_IN') {
            gameState.gameData = {
                phase: 'WAITING',
                winnerId: null,
            };
            startBuzzRound();

        } else if (gameId === 'WORD_RACE') {
            gameState.gameData = {
                category: WORD_RACE_CATEGORIES[Math.floor(Math.random() * WORD_RACE_CATEGORIES.length)],
                words: [],
                scores: {},
                endTime: Date.now() + 45000,
                active: true
            };
        } else if (gameId === 'REACTION') {
            gameState.gameData = {
                phase: 'WAITING',
                goTime: 0,
                results: {},
                fakeOut: false
            };
            startReactionRound();
        } else if (gameId === 'EMOJI_STORY') {
            const emojiPrompts = ['Your morning routine', 'A movie plot', 'Your biggest fear', 'Your dream vacation', 'A love story', 'A horror story', 'Your last meal'];
            gameState.gameData = {
                phase: 'INPUT',
                prompt: emojiPrompts[Math.floor(Math.random() * emojiPrompts.length)],
                inputs: {},
                currentStoryIndex: 0,
                currentStory: null,
                guesses: {},
            };
        } else if (gameId === 'BLUFF') {
            const playerIds = Object.keys(gameState.players);
            gameState.gameData = {
                phase: 'CLAIM',
                currentClaimerId: playerIds[Math.floor(Math.random() * playerIds.length)],
                claim: null,
                isLying: null,
                votes: {},
            };
        } else if (gameId === 'THIS_OR_THAT') {
            const choices = [
                ['🍕 Pizza', '🍔 Burger'],
                ['🏖️ Beach', '⛰️ Mountains'],
                ['🎬 Movies', '📺 TV Shows'],
                ['☕ Coffee', '🍵 Tea'],
                ['🌅 Morning', '🌃 Night'],
                ['💰 Rich & Lonely', '💕 Poor & Loved'],
                ['🦸 Fly', '🧠 Read Minds'],
                ['🔮 Past', '🚀 Future'],
            ];
            const choice = choices[Math.floor(Math.random() * choices.length)];
            gameState.gameData = {
                phase: 'CHOOSING',
                optionA: choice[0],
                optionB: choice[1],
                votes: {},
            };
        } else if (gameId === 'SPEED_DRAW') {
            const prompts = ['Cat', 'House', 'Car', 'Sun', 'Tree', 'Pizza', 'Robot', 'Ghost', 'Dragon', 'Rocket'];
            gameState.gameData = {
                phase: 'DRAWING',
                prompt: prompts[Math.floor(Math.random() * prompts.length)],
                drawings: {},
                votes: {},
                timer: 30,
            };
            // Start timer
            startTimer(30, () => {
                if (gameState.currentGame === 'SPEED_DRAW') {
                    gameState.gameData.phase = 'VOTING';
                    io.emit('gameState', gameState);
                }
            });
        } else if (gameId === 'CHAIN_REACTION') {
            const startWords = ['Happy', 'Fire', 'Water', 'Music', 'Dream', 'Light', 'Star', 'Love', 'Power', 'Magic'];
            const playerIds = Object.keys(gameState.players);
            gameState.gameData = {
                phase: 'ACTIVE',
                chain: [{ word: startWords[Math.floor(Math.random() * startWords.length)], playerId: 'system' }],
                currentPlayerIndex: 0,
                currentPlayerId: playerIds[0] || null,
                timer: 5,
                playerOrder: playerIds,
            };
            // Start chain timer
            startChainTimer();
        } else if (gameId === 'MIND_MELD') {
            const prompts = [
                'Name a pizza topping',
                'Name a superhero',
                'Name a country',
                'Name something yellow',
                'Name a movie genre',
                'Name a breakfast food',
                'Name something you find at the beach',
                'Name a sport',
            ];
            gameState.gameData = {
                phase: 'ANSWERING',
                prompt: prompts[Math.floor(Math.random() * prompts.length)],
                answers: {},
                matches: [],
                timer: 15,
            };
            startTimer(15, async () => {
                if (gameState.currentGame === 'MIND_MELD') {
                    gameState.gameData.phase = 'MATCHING';
                    io.emit('gameState', gameState);
                    // Process similarity matches
                    await processMindMeldMatches();
                }
            });
        } else if (gameId === 'COMPETE') {
            const playerIds = Object.keys(gameState.players);
            const challengers = playerIds.sort(() => Math.random() - 0.5).slice(0, 2);
            const challenges = [
                { type: 'TAP', target: 30 },
                { type: 'TYPE', target: 'The quick brown fox' },
                { type: 'SEQUENCE', target: { sequence: [1, 2, 3, 4, 5, 6, 7, 8, 9] } },
            ];
            gameState.gameData = {
                phase: 'COUNTDOWN',
                challenger1Id: challengers[0] || '',
                challenger2Id: challengers[1] || challengers[0] || '',
                challenge: challenges[Math.floor(Math.random() * challenges.length)],
                progress: {},
                timer: 3,
            };
            // 3-second countdown then start
            setTimeout(() => {
                if (gameState.currentGame === 'COMPETE') {
                    gameState.gameData.phase = 'ACTIVE';
                    io.emit('gameState', gameState);
                }
            }, 3000);
        } else if (gameId === 'BRAIN_BURST') {
            // Shuffle and pick 35 questions
            const shuffled = [...BRAIN_BURST_QUESTIONS].sort(() => Math.random() - 0.5).slice(0, 35);
            gameState.gameData = {
                phase: 'INTRO',
                questionIndex: 0,
                questions: shuffled,
                currentQuestion: shuffled[0],
                tier: BRAIN_BURST_TIERS[0],
                tiers: BRAIN_BURST_TIERS,
                timer: 20,
                answers: {},
                showResult: false,
                fiftyFiftyDisabled: [],
                lifelinesUsed: {},
                streaks: {},
            };
            // Auto-transition from INTRO to QUESTION after 3s
            setTimeout(() => {
                if (gameState.currentGame === 'BRAIN_BURST' && gameState.gameData.phase === 'INTRO') {
                    gameState.gameData.phase = 'QUESTION';
                    startTimer(20, () => {
                        if (gameState.currentGame === 'BRAIN_BURST' && gameState.gameData.phase === 'QUESTION') {
                            // Time's up — reveal answers
                            gameState.gameData.showResult = true;
                            gameState.gameData.phase = 'REVEAL';
                            // Score correct answers
                            scoreBrainBurstRound();
                            io.emit('gameState', gameState);
                            // Auto-advance to next question after 5s
                            setTimeout(() => {
                                if (gameState.currentGame === 'BRAIN_BURST' && gameState.gameData.phase === 'REVEAL') {
                                    advanceBrainBurst();
                                }
                            }, 5000);
                        }
                    });
                    io.emit('gameState', gameState);
                }
            }, 3500);
        } else if (gameId === 'GLOBAL_AVERAGES') {
            startGlobalAveragesRound(1);
            return; // `startGlobalAveragesRound` emits its own initial state
        }
        io.emit('gameState', gameState);
    });

    // Helper for Buzz In Round Start
    const startBuzzRound = () => {
        setTimeout(() => {
            if (gameState.currentGame === 'BUZZ_IN' && gameState.gameData.phase === 'WAITING') {
                gameState.gameData.phase = 'ACTIVE';
                io.emit('gameState', gameState);
            }
        }, Math.random() * 2000 + 2000); // Random 2-4s delay
    }

    // Helper for Reaction Round Start
    const startReactionRound = () => {
        // 30% chance of fakeout
        const isFakeOut = Math.random() < 0.3;
        gameState.gameData.fakeOut = false;

        if (isFakeOut) {
            setTimeout(() => {
                if (gameState.currentGame === 'REACTION' && gameState.gameData.phase === 'WAITING') {
                    gameState.gameData.fakeOut = true; // Trigger yellow flash
                    io.emit('gameState', gameState);

                    // Reset fakeout after 500ms and actually go green shortly after
                    setTimeout(() => {
                        gameState.gameData.fakeOut = false;
                        io.emit('gameState', gameState);

                        setTimeout(() => {
                            if (gameState.currentGame === 'REACTION' && gameState.gameData.phase === 'WAITING') {
                                gameState.gameData.phase = 'GO';
                                gameState.gameData.goTime = Date.now();
                                io.emit('gameState', gameState);
                            }
                        }, Math.random() * 1000 + 500);

                    }, 800);
                }
            }, Math.random() * 2000 + 1000);
        } else {
            setTimeout(() => {
                if (gameState.currentGame === 'REACTION' && gameState.gameData.phase === 'WAITING') {
                    gameState.gameData.phase = 'GO';
                    gameState.gameData.goTime = Date.now();
                    io.emit('gameState', gameState);
                }
            }, Math.random() * 3000 + 2000);
        }
    }

    // Helper for Chain Reaction
    const startChainTimer = () => {
        if (currentTimer) clearInterval(currentTimer);
        let time = 5;
        gameState.gameData.timer = time;
        io.emit('gameState', gameState);

        currentTimer = setInterval(() => {
            time--;
            gameState.gameData.timer = time;

            if (time <= 0) {
                if (currentTimer) clearInterval(currentTimer);
                // Time's up! Chain broken
                gameState.gameData.phase = 'RESULTS';
                gameState.gameData.failedPlayerId = gameState.gameData.currentPlayerId;
                io.emit('gameState', gameState);
            } else {
                io.emit('timerUpdate', time);
            }
        }, 1000);
    };

    // Helper for Mind Meld processing
    const processMindMeldMatches = async () => {
        const answers = gameState.gameData.answers;
        const playerIds = Object.keys(answers);
        const matches: { player1Id: string; player2Id: string; similarity: number }[] = [];

        // Compare every pair
        for (let i = 0; i < playerIds.length; i++) {
            for (let j = i + 1; j < playerIds.length; j++) {
                const p1 = playerIds[i];
                const p2 = playerIds[j];
                const sim = await checkSimilarity(answers[p1], answers[p2]);

                if (sim > 0.6) { // Threshold for a match
                    matches.push({ player1Id: p1, player2Id: p2, similarity: sim });
                    // Award points
                    const points = Math.round(sim * 100);
                    gameState.players[p1].score += points;
                    gameState.players[p2].score += points;
                }
            }
        }

        // Wait a bit for dramatic matching effect
        setTimeout(() => {
            gameState.gameData.phase = 'RESULTS';
            gameState.gameData.matches = matches;
            io.emit('gameState', gameState);
        }, 3000);
    };

    // Helper for scoring Brain Burst round
    const scoreBrainBurstRound = () => {
        const correctIdx = gameState.gameData.currentQuestion.correct;
        const tierPoints = gameState.gameData.tier.points;
        Object.entries(gameState.gameData.answers).forEach(([pid, ans]: [string, any]) => {
            if (ans === correctIdx) {
                // Streak bonus
                if (!gameState.gameData.streaks[pid]) gameState.gameData.streaks[pid] = 0;
                gameState.gameData.streaks[pid]++;
                const streakMultiplier = Math.min(gameState.gameData.streaks[pid], 3); // Max 3x
                const points = Math.round(tierPoints * (1 + (streakMultiplier - 1) * 0.25));
                if (gameState.players[pid]) gameState.players[pid].score += points;
            } else {
                // Reset streak
                gameState.gameData.streaks[pid] = 0;
            }
        });
        // Players who didn't answer also reset streak
        Object.keys(gameState.players).forEach(pid => {
            if (!gameState.gameData.answers[pid]) {
                gameState.gameData.streaks[pid] = 0;
            }
        });
    };

    // Helper to auto-advance Brain Burst to next question
    const advanceBrainBurst = () => {
        if (gameState.currentGame !== 'BRAIN_BURST') return;
        const nextIdx = gameState.gameData.questionIndex + 1;
        if (nextIdx >= 35) {
            // Game over!
            gameState.gameData.phase = 'GAME_OVER';
            updateLeaderboard();
            io.emit('gameState', gameState);

            // Auto-chain into Global Averages after 10 seconds of scoreboard
            setTimeout(() => {
                gameState.currentGame = 'GLOBAL_AVERAGES';
                startGlobalAveragesRound(1);

                Object.keys(gameState.players).forEach(pid => {
                    gameState.players[pid].bannedUntil = 0;
                    gameState.players[pid].gameVote = undefined;
                });
                io.emit('gameState', gameState);
            }, 10000);
        } else {
            gameState.gameData.questionIndex = nextIdx;
            gameState.gameData.currentQuestion = gameState.gameData.questions[nextIdx];
            gameState.gameData.tier = BRAIN_BURST_TIERS[nextIdx];
            gameState.gameData.showResult = false;
            gameState.gameData.answers = {};
            gameState.gameData.fiftyFiftyDisabled = [];
            gameState.gameData.phase = 'QUESTION';
            startTimer(20, () => {
                if (gameState.currentGame === 'BRAIN_BURST' && gameState.gameData.phase === 'QUESTION') {
                    gameState.gameData.showResult = true;
                    gameState.gameData.phase = 'REVEAL';
                    scoreBrainBurstRound();
                    io.emit('gameState', gameState);
                    // Auto-advance after reveal
                    setTimeout(() => {
                        if (gameState.currentGame === 'BRAIN_BURST' && gameState.gameData.phase === 'REVEAL') {
                            advanceBrainBurst();
                        }
                    }, 5000);
                }
            });
            io.emit('gameState', gameState);
        }
    };

    // GAME FLOW CONTROLS
    socket.on('nextRound', () => {
        if (gameState.currentGame === 'TRIVIA') {
            const nextIdx = gameState.gameData.questionIndex + 1;
            if (nextIdx < TRIVIA_QUESTIONS.length) {
                gameState.gameData.questionIndex = nextIdx;
                gameState.gameData.question = TRIVIA_QUESTIONS[nextIdx];
                gameState.gameData.showResult = false;
                gameState.gameData.answers = {};
            } else {
                gameState.status = 'RESULTS';
            }
            io.emit('gameState', gameState);

        } else if (gameState.currentGame === 'BUZZ_IN') {
            gameState.gameData = {
                phase: 'WAITING',
                winnerId: null,
            };
            io.emit('gameState', gameState);
            startBuzzRound();

        } else if (gameState.currentGame === 'REACTION') {
            gameState.gameData = {
                phase: 'WAITING',
                goTime: 0,
                results: {},
                fakeOut: false
            };
            io.emit('gameState', gameState);
            startReactionRound();

        } else if (gameState.currentGame === '2TRUTHS') {
            // ... (Previous logic for 2 Truths iteration)
            if (gameState.gameData.phase === 'REVEAL') {
                const playerIds = Object.keys(gameState.players);
                let nextIdx = 0;
                if (gameState.gameData.currentSubjectId) {
                    nextIdx = playerIds.indexOf(gameState.gameData.currentSubjectId) + 1;
                }
                if (nextIdx < playerIds.length) {
                    gameState.gameData.phase = 'VOTING';
                    gameState.gameData.currentSubjectId = playerIds[nextIdx];
                    gameState.gameData.votes = {};
                    gameState.gameData.showLie = false;
                    if (playerIds.length === 1) {
                        gameState.gameData.phase = 'REVEAL';
                        gameState.gameData.showLie = true;
                    }
                } else {
                    gameState.status = 'RESULTS';
                }
                io.emit('gameState', gameState);
            }
        } else if (gameState.currentGame === 'POLL') {
            if (gameState.gameData.phase === 'VOTING') {
                gameState.gameData.phase = 'RESULTS';
            } else {
                gameState.gameData.phase = 'VOTING';
                gameState.gameData.votes = {};
                gameState.gameData.prompt = POLL_PROMPTS[Math.floor(Math.random() * POLL_PROMPTS.length)];
            }
            io.emit('gameState', gameState);
        } else if (gameState.currentGame === 'WORD_RACE') {
            // New Category
            gameState.gameData.category = WORD_RACE_CATEGORIES[Math.floor(Math.random() * WORD_RACE_CATEGORIES.length)];
            gameState.gameData.words = [];
            gameState.gameData.scores = {};
            gameState.gameData.endTime = Date.now() + 45000;
            io.emit('gameState', gameState);
        } else if (gameState.currentGame === 'BRAIN_BURST') {
            if (gameState.gameData.phase === 'REVEAL' || gameState.gameData.phase === 'CELEBRATION') {
                const nextIdx = gameState.gameData.questionIndex + 1;
                if (nextIdx >= 15) {
                    // Game over!
                    gameState.gameData.phase = 'GAME_OVER';
                    io.emit('gameState', gameState);
                } else {
                    gameState.gameData.questionIndex = nextIdx;
                    gameState.gameData.currentQuestion = gameState.gameData.questions[nextIdx];
                    gameState.gameData.tier = BRAIN_BURST_TIERS[nextIdx];
                    gameState.gameData.showResult = false;
                    gameState.gameData.answers = {};
                    gameState.gameData.fiftyFiftyDisabled = [];
                    gameState.gameData.phase = 'QUESTION';
                    startTimer(20, () => {
                        if (gameState.currentGame === 'BRAIN_BURST' && gameState.gameData.phase === 'QUESTION') {
                            gameState.gameData.showResult = true;
                            gameState.gameData.phase = 'REVEAL';
                            scoreBrainBurstRound();
                            io.emit('gameState', gameState);
                        }
                    });
                    io.emit('gameState', gameState);
                }
            } else {
                gameState.status = 'RESULTS';
                io.emit('gameState', gameState);
            }
        } else {
            gameState.status = 'RESULTS';
            io.emit('gameState', gameState);
        }
    });

    socket.on('backToLobby', () => {
        gameState.status = 'GAME_SELECT';
        gameState.currentGame = undefined;
        gameState.gameData = undefined;
        io.emit('gameState', gameState);
    });

    // --- TRIVIA LOGIC ---
    socket.on('submitAnswer', (answerIndex: number) => {
        if (gameState.status === 'PLAYING' && gameState.currentGame === 'TRIVIA') {
            if (!gameState.gameData.answers) gameState.gameData.answers = {};
            gameState.gameData.answers[socket.id] = answerIndex;

            const playerCount = Object.keys(gameState.players).length;
            const answerCount = Object.keys(gameState.gameData.answers).length;

            if (answerCount >= playerCount) {
                gameState.gameData.showResult = true;
                Object.entries(gameState.gameData.answers).forEach(([pid, ans]: [string, any]) => {
                    if (ans === gameState.gameData.question.correct) {
                        if (gameState.players[pid]) gameState.players[pid].score += 100;
                    }
                });
            }
            io.emit('gameState', gameState);
        }
    });

    // --- 2 TRUTHS LOGIC ---
    socket.on('submitStatements', (data: { statements: string[], lieIndex: number }) => {
        if (gameState.currentGame !== '2TRUTHS') return;
        gameState.gameData.inputs[socket.id] = data;
        const playerCount = Object.keys(gameState.players).length;
        const inputCount = Object.keys(gameState.gameData.inputs).length;
        if (inputCount >= playerCount) {
            gameState.gameData.phase = 'VOTING';
            gameState.gameData.currentSubjectId = Object.keys(gameState.players)[0];
            gameState.gameData.votes = {};
            gameState.gameData.showLie = false;
            if (playerCount === 1) {
                gameState.gameData.phase = 'REVEAL';
                gameState.gameData.showLie = true;
            }
        }
        io.emit('gameState', gameState);
    });

    socket.on('voteLie', (statementIndex: number) => {
        if (gameState.currentGame !== '2TRUTHS' || gameState.gameData.phase !== 'VOTING') return;
        gameState.gameData.votes[socket.id] = statementIndex;
        const currentSubjectId = gameState.gameData.currentSubjectId;
        const voters = Object.keys(gameState.players).filter(id => id !== currentSubjectId);
        const currentVotes = Object.keys(gameState.gameData.votes).length;
        if (currentVotes >= voters.length) {
            gameState.gameData.showLie = true;
            gameState.gameData.phase = 'REVEAL';
            const actualLieIndex = gameState.gameData.inputs[currentSubjectId].lieIndex;
            Object.entries(gameState.gameData.votes).forEach(([voterId, voteIdx]: [string, any]) => {
                if (voteIdx === actualLieIndex) {
                    if (gameState.players[voterId]) gameState.players[voterId].score += 50;
                } else {
                    if (gameState.players[currentSubjectId]) gameState.players[currentSubjectId].score += 25;
                }
            });
        }
        io.emit('gameState', gameState);
    });

    // --- HOT TAKES LOGIC ---
    socket.on('submitTake', (text: string) => {
        if (gameState.currentGame !== 'HOT_TAKES') return;
        if (!gameState.gameData.inputs) gameState.gameData.inputs = {};
        gameState.gameData.inputs[socket.id] = text;
        const playerCount = Object.keys(gameState.players).length;
        const inputCount = Object.keys(gameState.gameData.inputs).length;
        if (inputCount >= playerCount) {
            gameState.gameData.phase = 'VOTING';
            if (playerCount === 1) {
                gameState.gameData.phase = 'RESULTS';
            }
        }
        io.emit('gameState', gameState);
    });

    socket.on('voteTake', (targetPlayerId: string) => {
        if (gameState.currentGame !== 'HOT_TAKES' || gameState.gameData.phase !== 'VOTING') return;
        if (!gameState.gameData.votes) gameState.gameData.votes = {};
        gameState.gameData.votes[socket.id] = targetPlayerId;
        const playerCount = Object.keys(gameState.players).length;
        const voteCount = Object.keys(gameState.gameData.votes).length;
        if (voteCount >= playerCount) {
            gameState.gameData.phase = 'RESULTS';
            Object.values(gameState.gameData.votes).forEach((targetId: any) => {
                if (gameState.players[targetId]) gameState.players[targetId].score += 100;
            });
        }
        io.emit('gameState', gameState);
    });

    // --- POLL LOGIC ---
    socket.on('submitPollVote', (targetId: string) => {
        if (gameState.currentGame !== 'POLL') return;
        if (!gameState.gameData.votes) gameState.gameData.votes = {};
        gameState.gameData.votes[socket.id] = targetId;
        const playerCount = Object.keys(gameState.players).length;
        const voteCount = Object.keys(gameState.gameData.votes).length;
        if (voteCount >= playerCount) {
            gameState.gameData.phase = 'RESULTS';
        }
        io.emit('gameState', gameState);
    });

    // --- BUZZ IN LOGIC (WITH PENALTY) ---
    socket.on('buzz', () => {
        if (gameState.currentGame !== 'BUZZ_IN') return;

        // Check for ban
        if (gameState.players[socket.id]?.bannedUntil && gameState.players[socket.id].bannedUntil! > Date.now()) {
            return; // Ignore spam
        }

        if (gameState.gameData.phase === 'WAITING') {
            // FALSE START!
            gameState.players[socket.id].bannedUntil = Date.now() + 2000; // 2s ban
            socket.emit('falseStart'); // Notify client
            return;
        }

        if (gameState.gameData.phase === 'ACTIVE') {
            gameState.gameData.phase = 'BUZZED';
            gameState.gameData.winnerId = socket.id;
            if (gameState.players[socket.id]) gameState.players[socket.id].score += 50;
            io.emit('gameState', gameState);
        }
    });

    // --- WORD RACE LOGIC (WITH VALIDATION) ---
    socket.on('submitWord', (word: string) => {
        if (gameState.currentGame !== 'WORD_RACE' || !gameState.gameData.active) return;

        // Validation
        if (word.length < 3) return;
        if (gameState.gameData.words.find((w: any) => w.word.toLowerCase() === word.toLowerCase() && w.playerId === socket.id)) return; // No duplicates for same player

        // Simple category check (optional, hard to automate perfectly without AI, but we can do length/anti-spam)
        if (!gameState.gameData.scores[socket.id]) gameState.gameData.scores[socket.id] = 0;

        gameState.gameData.scores[socket.id] += 10;
        if (gameState.players[socket.id]) gameState.players[socket.id].score += 10;

        gameState.gameData.words.push({
            playerId: socket.id,
            word: word,
        });
        io.emit('gameState', gameState);
    });

    // --- GLOBAL AVERAGES LOGIC ---
    socket.on('submitAverageGuess', (guess: number) => {
        if (gameState.currentGame === 'GLOBAL_AVERAGES' && gameState.gameData?.phase === 'WAITING') {
            gameState.gameData.guesses[socket.id] = guess;

            // Check if everyone has guessed, if so, trigger reveal early
            const playerCount = Object.keys(gameState.players).filter((p: string) => !gameState.players[p].isHost).length;
            const guessCount = Object.keys(gameState.gameData.guesses).length;

            if (guessCount >= playerCount && playerCount > 0) {
                revealGlobalAveragesLogic();
            } else {
                io.emit('gameState', gameState);
            }
        }
    });

    socket.on('revealGlobalAverages', () => {
        // Keep the handler in case a manual override is needed, but point it to the shared logic
        if (gameState.hostId === socket.id && gameState.currentGame === 'GLOBAL_AVERAGES') {
            revealGlobalAveragesLogic();
        }
    });

    // --- SKILL SHOWDOWN LOGIC ---
    socket.on('submitSkillResult', (data: any) => {
        if (gameState.currentGame === 'SKILL_SHOWDOWN' && gameState.gameData?.phase === 'PLAYING') {
            gameState.gameData.submissions[socket.id] = data;

            // Check if all non-host players have submitted
            const playerCount = Object.keys(gameState.players).filter((p: string) => !gameState.players[p].isHost).length;
            const submitCount = Object.keys(gameState.gameData.submissions).length;

            if (submitCount >= playerCount && playerCount > 0) {
                scoreAndRevealSkillShowdown();
            } else {
                io.emit('gameState', gameState);
            }
        }
    });

    // --- REACTION LOGIC (WITH FAKEOUT) ---
    socket.on('reactionClick', () => {
        if (gameState.currentGame !== 'REACTION') return;

        if (gameState.gameData.phase === 'WAITING') {
            // False start logic could go here too, but simple ignore is fine or penalty
            if (gameState.players[socket.id]) gameState.players[socket.id].score -= 10; // Small penalty
            return;
        }

        if (gameState.gameData.phase === 'GO' && !gameState.gameData.results[socket.id]) {
            const diff = Date.now() - gameState.gameData.goTime;
            gameState.gameData.results[socket.id] = diff;

            if (diff < 300) {
                if (gameState.players[socket.id]) gameState.players[socket.id].score += 100;
            } else if (diff < 500) {
                if (gameState.players[socket.id]) gameState.players[socket.id].score += 50;
            }
            io.emit('gameState', gameState);
        }
    });

    // --- EMOJI STORY LOGIC ---
    socket.on('emojiInput', (story: string) => {
        if (gameState.currentGame !== 'EMOJI_STORY') return;
        if (!gameState.gameData.inputs) gameState.gameData.inputs = {};
        gameState.gameData.inputs[socket.id] = story;
        const playerCount = Object.keys(gameState.players).length;
        const inputCount = Object.keys(gameState.gameData.inputs).length;
        if (inputCount >= playerCount) {
            gameState.gameData.phase = 'VOTING';
        }
        io.emit('gameState', gameState);
    });

    socket.on('submitGuess', (guess: string) => {
        if (gameState.currentGame !== 'EMOJI_STORY') return;
        if (!gameState.gameData.guesses) gameState.gameData.guesses = {};
        gameState.gameData.guesses[socket.id] = guess;
        const playerCount = Object.keys(gameState.players).length;
        const guessCount = Object.keys(gameState.gameData.guesses).length;
        if (guessCount >= playerCount) {
            gameState.gameData.phase = 'REVEAL';
        }
        io.emit('gameState', gameState);
    });

    // --- BLUFF LOGIC ---
    socket.on('submitClaim', (data: { claim: string, isLying: boolean }) => {
        if (gameState.currentGame !== 'BLUFF') return;
        gameState.gameData.claim = data.claim;
        gameState.gameData.isLying = data.isLying;
        gameState.gameData.phase = 'VOTING';
        gameState.gameData.votes = {};
        io.emit('gameState', gameState);
    });

    socket.on('voteBluff', (thinkingLying: boolean) => {
        if (gameState.currentGame !== 'BLUFF' || gameState.gameData.phase !== 'VOTING') return;
        gameState.gameData.votes[socket.id] = thinkingLying;
        const playerCount = Object.keys(gameState.players).length;
        const voteCount = Object.keys(gameState.gameData.votes).length;
        if (voteCount >= playerCount - 1) { // Everyone except the claimer
            gameState.gameData.phase = 'REVEAL';
            const actualIsLying = gameState.gameData.isLying;
            const claimerId = gameState.gameData.currentClaimerId;

            Object.entries(gameState.gameData.votes).forEach(([voterId, vote]: [string, any]) => {
                if (vote === actualIsLying) {
                    if (gameState.players[voterId]) gameState.players[voterId].score += 100;
                } else {
                    if (gameState.players[claimerId]) gameState.players[claimerId].score += 50;
                }
            });
        }
        io.emit('gameState', gameState);
    });

    // --- THIS OR THAT LOGIC ---
    socket.on('voteOption', (option: 'A' | 'B') => {
        if (gameState.currentGame !== 'THIS_OR_THAT') return;
        if (!gameState.gameData.votes) gameState.gameData.votes = {};
        gameState.gameData.votes[socket.id] = option;
        const playerCount = Object.keys(gameState.players).length;
        const voteCount = Object.keys(gameState.gameData.votes).length;
        if (voteCount >= playerCount) {
            gameState.gameData.phase = 'REVEAL';
        }
        io.emit('gameState', gameState);
    });

    // --- SPEED DRAW LOGIC ---
    socket.on('submitDrawing', (drawing: string) => {
        if (gameState.currentGame !== 'SPEED_DRAW') return;
        gameState.gameData.drawings[socket.id] = drawing;
        const playerCount = Object.keys(gameState.players).length;
        const drawCount = Object.keys(gameState.gameData.drawings).length;
        if (drawCount >= playerCount) {
            gameState.gameData.phase = 'VOTING';
        }
        io.emit('gameState', gameState);
    });

    socket.on('voteDrawing', (targetId: string) => {
        if (gameState.currentGame !== 'SPEED_DRAW' || gameState.gameData.phase !== 'VOTING') return;
        gameState.gameData.votes[socket.id] = targetId;
        const playerCount = Object.keys(gameState.players).length;
        const voteCount = Object.keys(gameState.gameData.votes).length;
        if (voteCount >= playerCount) {
            gameState.gameData.phase = 'RESULTS';
            Object.values(gameState.gameData.votes).forEach((tid: any) => {
                if (gameState.players[tid]) gameState.players[tid].score += 100;
            });
        }
        io.emit('gameState', gameState);
    });

    // --- CHAIN REACTION LOGIC ---
    socket.on('submitChainWord', (word: string) => {
        if (gameState.currentGame !== 'CHAIN_REACTION' || gameState.gameData.phase !== 'ACTIVE') return;
        if (socket.id !== gameState.gameData.currentPlayerId) return;

        gameState.gameData.chain.push({ word, playerId: socket.id });
        if (gameState.players[socket.id]) gameState.players[socket.id].score += 10;

        // Move to next player
        const nextIdx = (gameState.gameData.currentPlayerIndex + 1) % gameState.gameData.playerOrder.length;
        gameState.gameData.currentPlayerIndex = nextIdx;
        gameState.gameData.currentPlayerId = gameState.gameData.playerOrder[nextIdx];

        // Reset timer
        startChainTimer();
        io.emit('gameState', gameState);
    });

    // --- MIND MELD LOGIC ---
    socket.on('submitMindMeldAnswer', (answer: string) => {
        if (gameState.currentGame !== 'MIND_MELD' || gameState.gameData.phase !== 'ANSWERING') return;
        gameState.gameData.answers[socket.id] = answer;
        const playerCount = Object.keys(gameState.players).length;
        const answerCount = Object.keys(gameState.gameData.answers).length;
        if (answerCount >= playerCount) {
            gameState.gameData.phase = 'MATCHING';
            processMindMeldMatches();
        }
        io.emit('gameState', gameState);
    });

    // --- COMPETE LOGIC ---
    socket.on('competeProgress', (progress: number) => {
        if (gameState.currentGame !== 'COMPETE' || gameState.gameData.phase !== 'ACTIVE') return;
        gameState.gameData.progress[socket.id] = progress;

        const target = gameState.gameData.challenge.target;
        if (progress >= (typeof target === 'number' ? target : target.length || 100)) {
            gameState.gameData.phase = 'RESULTS';
            gameState.gameData.winnerId = socket.id;
            if (gameState.players[socket.id]) gameState.players[socket.id].score += 100;
        }
        io.emit('gameState', gameState);
    });

    // --- BRAIN BURST LOGIC ---
    socket.on('submitBrainBurstAnswer', (answerIndex: number) => {
        if (gameState.currentGame !== 'BRAIN_BURST' || gameState.gameData.phase !== 'QUESTION') return;
        if (gameState.gameData.answers[socket.id] !== undefined) return; // Already answered
        gameState.gameData.answers[socket.id] = answerIndex;

        const playerCount = Object.keys(gameState.players).filter(id => id !== gameState.hostId).length;
        const answerCount = Object.keys(gameState.gameData.answers).length;

        if (answerCount >= playerCount) {
            // All answered — reveal
            if (currentTimer) clearTimeout(currentTimer);
            gameState.gameData.showResult = true;
            gameState.gameData.phase = 'REVEAL';
            // Score
            scoreBrainBurstRound();
            // Auto-advance after 5s
            setTimeout(() => {
                if (gameState.currentGame === 'BRAIN_BURST' && gameState.gameData.phase === 'REVEAL') {
                    advanceBrainBurst();
                }
            }, 5000);
        }
        io.emit('gameState', gameState);
    });

    socket.on('useBrainBurstLifeline', () => {
        if (gameState.currentGame !== 'BRAIN_BURST' || gameState.gameData.phase !== 'QUESTION') return;
        if (gameState.gameData.lifelinesUsed[socket.id]) return; // Already used
        gameState.gameData.lifelinesUsed[socket.id] = true;

        // Remove 2 wrong answers
        const correctIdx = gameState.gameData.currentQuestion.correct;
        const wrongIndices = [0, 1, 2, 3].filter(i => i !== correctIdx);
        // Shuffle wrong and pick 2 to disable
        const shuffledWrong = wrongIndices.sort(() => Math.random() - 0.5);
        gameState.gameData.fiftyFiftyDisabled = shuffledWrong.slice(0, 2);
        io.emit('gameState', gameState);
    });

    socket.on('disconnect', () => {
        console.log('Client disconnected:', socket.id);
        if (gameState.players[socket.id]) {
            delete gameState.players[socket.id];
            io.emit('gameState', gameState);
        }
    });
});

httpServer.listen(PORT, () => {
    console.log(`Server listening on internal port ${PORT}`);
});
