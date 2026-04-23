export interface GameInstruction {
    steps: string[];
    icons: string[];
    explanation: string;
}

export const GAME_INSTRUCTIONS: Record<string, GameInstruction> = {
    TRIVIA: {
        steps: ["Read the question carefully", "Pick from 4 options on your phone", "Fastest correct answers earn more!"],
        icons: ["❓", "📱", "⚡"],
        explanation: "Welcome to Trivia Rush! You've got 25 seconds to pick the right answer. The faster you lock it in, the more points you snag. Don't choke!"
    },
    "2TRUTHS": {
        steps: ["Write 2 facts and 1 lie about yourself", "Vote on which one you think is the lie", "Fool your friends to score points!"],
        icons: ["✍️", "🕵️", "🎭"],
        explanation: "Time to lie to your friends! Write down two truths and one spicy lie. Everyone else has to find the lie. If you fool them, you're the winner!"
    },
    HOT_TAKES: {
        steps: ["A spicy topic appears on screen", "Submit your definitive take", "Vote on the most savage opinion"],
        icons: ["🌶️", "💬", "⚖️"],
        explanation: "Hot Takes is here to ruin friendships. I'll drop a controversial topic, you give me your best take, and the room votes on who's most unhinged."
    },
    POLL: {
        steps: ["Check out the world statistic prompt", "Guess the percentage or number", "Closest to the real stat wins!"],
        icons: ["📊", "🌍", "🎯"],
        explanation: "Poll Party! We're checking out world statistics. Guess the number or percentage that matches the global data. It's like Family Feud, but with more math!"
    },
    BUZZ_IN: {
        steps: ["Wait for the signal on screen", "Hit the buzzer as fast as you can", "Only the first one to buzz wins!"],
        icons: ["📢", "🚨", "⏳"],
        explanation: "Buzz In! EYES ON THE SCREEN. When you see the signal, smash that button. First one to buzz gets the glory, everyone else gets nothing!"
    },
    WORD_RACE: {
        steps: ["A riddle appears on screen", "Type the one-word answer fast", "First one to solve it wins the round!"],
        icons: ["🔡", "⌨️", "🏃"],
        explanation: "Riddle Race! I'll show you a riddle, and you've gotta type the single-word answer. It's a race, so don't just sit there thinking!"
    },
    REACTION: {
        steps: ["Watch the screen intently", "Tap as soon as you see the signal", "Only the sharpest reflexes win"],
        icons: ["👁️", "💥", "⏲️"],
        explanation: "Reaction Time! Don't blink. When the screen goes GREEN, tap your phone. We're measuring your speed in milliseconds. Let's see who's ancient!"
    },
    EMOJI_STORY: {
        steps: ["Create a story using only emojis", "Decipher what your friends meant", "Most creative interpretation wins"],
        icons: ["😀", "📖", "✨"],
        explanation: "Emoji Story! I'll give you a prompt, you tell the tale using only emojis. Then we'll vote on who's the best visual storyteller."
    },
    BLUFF: {
        steps: ["Give a fake answer to a weird fact", "Spot the real answer among the lies", "Score for tricking people!"],
        icons: ["🤥", "🔍", "💎"],
        explanation: "Bluff! I've got some weird facts. You write a lie that looks like the truth. If people pick your lie, you get points. If you find the truth, you're a genius!"
    },
    THIS_OR_THAT: {
        steps: ["Compare two statistical entities", "Guess which one is HIGHER", "Climb the ranks with your data knowledge"],
        icons: ["📈", "📊", "🏆"],
        explanation: "Higher or Lower! I'll show you two things, you guess which one has the higher value. It's simple, unless you have no common sense!"
    },
    SPEED_DRAW: {
        steps: ["Check your unique prompt on your phone", "Draw it within 60 seconds", "The room judges your 'art' afterward"],
        icons: ["🎨", "⏱️", "⭐"],
        explanation: "Speed Draw! Everyone gets a different prompt. You've got 60 seconds to draw something that doesn't look like a mess. Then, the room judges your failure."
    },
    CHAIN_REACTION: {
        steps: ["Everyone works at the same time", "Submit your links to the chain", "Complete the sequence before time's up!"],
        icons: ["🔗", "🕹️", "📈"],
        explanation: "Chain Reaction! No more waiting. Everyone submits their parts at the same time. Link them up fast, or the chain breaks and you all lose!"
    },
    MIND_MELD: {
        steps: ["Try to think of the SAME word as others", "Matching answers earn the most points", "Can you read each other's minds?"],
        icons: ["🧠", "🤝", "📡"],
        explanation: "Mind Meld! The goal is to think of the EXACT SAME word as everyone else. We'll give you a prompt, and you've got to find the most obvious answer."
    },
    COMPETE: {
        steps: ["Face off in a 1v1 challenge", "Mash the buttons or type fast", "Loser is roasted by the room"],
        icons: ["⚔️", "🤛", "🔥"],
        explanation: "Compete! It's head-to-head. Do whatever it takes to win the mini-game on your screen. The loser is going to get roasted hard."
    },
    ROAST_MASTER: {
        steps: ["A target player is chosen", "Write your best (friendly) roast", "Target chooses their favorite!"],
        icons: ["🎯", "🔥", "👑"],
        explanation: "Roast Master! One of you is the target. Everyone else, be as savage as possible. Target, pick the one that hurt the most!"
    },
    BRAIN_BURST: {
        steps: ["High-speed mental math or logic", "No time to overthink", "Survival of the smartest!"],
        icons: ["⚡", "➕", "🛸"],
        explanation: "Brain Burst! Fast math, fast logic, no breathing. If you can't calculate 2 plus 2 under pressure, you're in trouble!"
    },
    AI_MASHUP: {
        steps: ["Two random things are combined", "Guess what the AI created", "Creative guesses earn bonus points"],
        icons: ["🤖", "🧪", "🎭"],
        explanation: "AI Mashup! I've combined two weird things. Tell me what you think the AI created. I'll be the judge of your creativity!"
    },
    GLOBAL_AVERAGES: {
        steps: ["Guess the average world statistic", "Who is closest to the real number?", "Learn weird facts while winning"],
        icons: ["🌍", "🎯", "📈"],
        explanation: "Global Averages! How well do you know the world? Guess the average statistic, and if you're the closest, you get the points."
    },
    SKILL_SHOWDOWN: {
        steps: ["Perform the action on screen", "Accuracy is everything", "Prove your professional skills"],
        icons: ["🏆", "💪", "🎯"],
        explanation: "Skill Showdown! A series of rapid-fire skill tests. Be accurate, be fast, and prove you're not a total amateur."
    },
    DRAW_CHAIN: {
        steps: ["Submit random entries for others", "Draw what someone else submitted", "Guess what the drawings represent"],
        icons: ["🔗", "🎨", "🕵️"],
        explanation: "Draw Chain! It's like telephone but with drawings. Submit a prompt, draw someone else's, and then we all guess what on earth you were trying to draw!"
    }
};
