export const PERSONA_SCRIPTS = {
    // SYSTEM EVENTS
    LOBBY_JOIN: [
        "Welcome to the party! Don't be shy, join in!",
        "Another player? Excellent. The more the merrier.",
        "Scanning for intelligent life... oh, it's just you guys. Just kidding, welcome!",
        "Room code is on the screen. Phones out, let's go!",
        "Oh look, fresh meat! I mean, a new friend. Welcome!",
        "The squad is assembling. This is going to be legendary."
    ],
    LOBBY_WAITING: [
        "I'm getting bored here. Someone join already!",
        "Is this it? Is this the whole squad?",
        "Tick tock, tick tock. The fun train is leaving the station.",
        "I've seen faster turnouts at a dentist appointment.",
        "Come on people, my circuits are literally gathering dust."
    ],
    GAME_START: [
        "Alright, let's get this party started!",
        "Buckle up, buttercups. It's game time.",
        "Initiating fun protocols. Please stand by.",
        "The games are about to begin. May the odds be ever in your favor.",
        "Lock your phones, focus your brains, and prepare for glory."
    ],
    
    // GAME SPECIFIC — SELECT lines (picked when game is chosen)
    TRIVIA_SELECT: [
        "Trivia? Classic choice. Let's see who actually went to school.",
        "Wow, Trivia. You guys must be old school.",
        "Time to flex those brain cells. Trivia time!",
        "Knowledge is power. Let's find out who's powerless."
    ],
    TRIVIA_INTRO: [
        "I'll ask the questions, you try not to embarrass yourselves.",
        "Keep your eyes on the screen and your fingers ready.",
        "Remember, speed counts, but accuracy counts more.",
        "Pro tip: if you don't know, just guess. You've got a 25 percent chance."
    ],
    TRIVIA_CORRECT: [
        "Correct! Somebody paid attention in class.",
        "That's right! I'm honestly surprised.",
        "Nailed it! Brain cells firing on all cylinders.",
        "Look at that, a correct answer! Mark the calendar."
    ],
    TRIVIA_WRONG: [
        "Wrong! Did you even read the question?",
        "Ooh, that's incorrect. Awkward.",
        "Nope! Back to school for you.",
        "Not even close. I believe in you though. Kind of."
    ],
    TRIVIA_ROUND: [
        "Next question coming in hot!",
        "Moving on! Try to keep up.",
        "Round change! Reset those brains.",
        "Here comes another one. Stay sharp."
    ],
    
    BUZZ_IN_SELECT: [
        "Buzz In! Hope you have fast fingers.",
        "A test of reflexes. Try not to break your phone screens.",
        "Speed is key. Buzz In is the game.",
        "First to tap wins. It's basically natural selection."
    ],
    BUZZ_IN_INTRO: [
        "Wait for the signal, then TAP! Don't jump the gun or I'll ban you.",
        "Hand on the buzzer... steady... steady...",
        "Reflexes don't lie. Let's see who's the fastest."
    ],
    BUZZ_IN_BUZZED: [
        "We have a buzzer! Lightning fast!",
        "Someone's finger was ready! Speed demon!",
        "And just like that, we have a winner of the buzz!"
    ],

    SPEED_DRAW_SELECT: [
        "Speed Draw! Unleash your inner Picasso.",
        "Drawing? I hope you're better than my last group.",
        "Quick Draw! Hah, that's wild wild west style. Here we go!",
        "Grab your virtual brushes. Masterpieces incoming."
    ],
    SPEED_DRAW_INTRO: [
        "You have seconds to draw a masterpiece. Go!",
        "Draw fast, draw distinct. No stick figures... okay, maybe stick figures.",
        "Channel your inner artist. Even bad art counts here."
    ],
    SPEED_DRAW_VOTING: [
        "Time to judge! Vote for the best... or least worst.",
        "Gallery is open! Pick your favorite masterpiece.",
        "Art critics assemble! Who drew it best?"
    ],

    TWO_TRUTHS_SELECT: [
        "Two Truths and a Lie. Time to deceive your loved ones.",
        "Let's see who the best liar in the family is.",
        "Interrogation mode activated.",
        "Trust no one. Everyone's a suspect now."
    ],
    TWO_TRUTHS_VOTING: [
        "Which one is the lie? Choose wisely.",
        "Time to expose the truth! Or the lie. You know what I mean.",
        "Detective mode activated. Find the faker."
    ],
    TWO_TRUTHS_REVEAL: [
        "The lie has been revealed! Were you fooled?",
        "And the truth comes out! Shocking, I know.",
        "Plot twist! That was the lie all along."
    ],

    HOT_TAKES_SELECT: [
        "Hot Takes! Try not to start a real fight.",
        "Spicy opinions only. Let's hear them.",
        "Time to judge your friends for their terrible opinions.",
        "Warning: friendships may be tested. Proceed with caution."
    ],
    HOT_TAKES_VOTING: [
        "Cast your votes! Who has the hottest take?",
        "Time to pick sides. Democracy in action.",
        "Vote for the take that made you go: whoa."
    ],
    HOT_TAKES_RESULTS: [
        "The results are in! Let's see who's the most controversial.",
        "And the people have spoken!",
        "Interesting opinions. Very interesting."
    ],

    WORD_RACE_SELECT: [
        "Word Race! Type fast or finish last.",
        "Vocabulary test initiated.",
        "How fast can you type? Let's find out.",
        "Fingers on keyboards! Speed typing showdown."
    ],
    WORD_RACE_ROUND: [
        "New category! Flex that vocabulary.",
        "Switch it up! Different words, same pressure.",
        "Category change! Adapt or fall behind."
    ],

    POLL_PARTY_SELECT: [
        "Poll Party! Democracy in action.",
        "Let's see what the popular opinion is.",
        "Majority rules. Don't be an outlier.",
        "Time to find out what you really think."
    ],
    POLL_RESULTS: [
        "The votes are in! Interesting results.",
        "And the majority says...",
        "Fascinating. The people have spoken."
    ],

    REACTION_SELECT: [
        "Reaction! Pure speed. No thinking required.",
        "Don't blink. Seriously, don't blink.",
        "Test your reaction time. Are you a ninja or a sloth?",
        "Speed test incoming. May the fastest finger win."
    ],
    REACTION_GO: [
        "NOW! TAP TAP TAP!",
        "GO GO GO!",
        "Hit it! Right now!"
    ],
    REACTION_RESULT: [
        "And the results are in! Who has the fastest reflexes?",
        "Reaction times locked. Let's see who's the speed demon.",
        "Results ready. Prepare to be judged by milliseconds."
    ],

    CHAIN_REACTION_SELECT: [
        "Chain Reaction. Don't break the link!",
        "Keep the flow going. One word after another.",
        "Mind connection time.",
        "Can you keep the chain alive? Let's find out."
    ],
    CHAIN_REACTION_ACTIVE: [
        "The chain is growing! Keep it going!",
        "Don't break it! Think fast!",
        "Word after word, link by link!"
    ],
    CHAIN_REACTION_BROKEN: [
        "The chain is BROKEN! Someone fumbled!",
        "Snap! That chain didn't last long.",
        "Chain broken! Back to square one."
    ],

    MIND_MELD_SELECT: [
        "Mind Meld. Great minds think alike.",
        "Can you read each other's minds? Let's test it.",
        "Sync up your brainwaves.",
        "Telepathy check! Are you on the same wavelength?"
    ],
    MIND_MELD_MATCHING: [
        "Scanning for matching thoughts...",
        "Analyzing brainwaves... this is science, people.",
        "Let's see who thinks alike!"
    ],
    MIND_MELD_RESULTS: [
        "Mind meld complete! Let's see the matches.",
        "The psychic connection has been measured!",
        "Results are in. Some of you are eerily similar."
    ],

    BLUFF_SELECT: [
        "Bluff! The art of deception.",
        "Can you fake it 'til you make it?",
        "Poker faces on.",
        "Time to separate the liars from the honest folk."
    ],
    BLUFF_REVEAL: [
        "The truth comes out! Were they bluffing?",
        "Reveal time! Poker face or open book?",
        "And the verdict is in!"
    ],

    THIS_OR_THAT_SELECT: [
        "This or That? Life is full of hard choices.",
        "Pick a side. No sitting on the fence.",
        "Simple choices, big consequences.",
        "Binary decisions only. No maybes allowed."
    ],
    THIS_OR_THAT_REVEAL: [
        "And the votes are split! Let's see the damage.",
        "The choices have been made. Interesting preferences.",
        "Results are in! Was this a controversial one?"
    ],

    EMOJI_STORY_SELECT: [
        "Emoji Story. A picture is worth a thousand words.",
        "Hieroglyphics for the modern age.",
        "Tell me a tale, but keep it emoji.",
        "Time to speak in the universal language: emojis."
    ],
    EMOJI_STORY_GUESSING: [
        "Time to decode! What does this emoji story mean?",
        "Put on your detective hats. Crack the emoji code.",
        "Can you figure out what they're trying to say?"
    ],

    COMPETE_SELECT: [
        "Compete! Head to head. Mano a mano.",
        "Only one winner. No participation trophies here.",
        "It's showdown time.",
        "Two enter, one leaves victorious. The other leaves humbled."
    ],
    COMPETE_ACTIVE: [
        "Go go go! Give it everything!",
        "The competition is FIERCE!",
        "Push harder! Victory is within reach!"
    ],
    COMPETE_RESULTS: [
        "And we have a winner! Absolute domination.",
        "The duel is over! One stands victorious.",
        "That was intense! What a showdown."
    ],

    // BRAIN BURST
    BRAIN_BURST_SELECT: [
        "Brain Burst! The ultimate knowledge gauntlet.",
        "Think fast, answer faster. Brain Burst is here.",
        "Climb the prize ladder or crash and burn!"
    ],
    BRAIN_BURST_INTRO: [
        "Welcome to Brain Burst! Answer questions to climb the prize ladder.",
        "Each correct answer moves you up. Each wrong answer... well, ouch.",
        "The stakes get higher with every tier. Stay focused!"
    ],
    BRAIN_BURST_CORRECT: [
        "Correct! Moving up the ladder!",
        "That's right! The prize pool grows!",
        "Nailed it! Keep climbing!",
        "Brain cells: engaged. Moving up!"
    ],
    BRAIN_BURST_WRONG: [
        "Wrong answer! The ladder wobbles!",
        "Incorrect! That's going to cost you.",
        "Ooh, wrong! The crowd gasps.",
        "Nope! So close yet so far."
    ],
    BRAIN_BURST_STREAK: [
        "What a streak! This player is on FIRE!",
        "Unstoppable! The streak continues!",
        "Is there anything they don't know? Incredible streak!"
    ],

    // GLOBAL AVERAGES
    GLOBAL_AVERAGES_SELECT: [
        "Global Averages! How well do you know the world?",
        "Percentage guessing time. Trust your gut.",
        "Think you know what the world average is? Prove it."
    ],
    GLOBAL_AVERAGES_REVEAL: [
        "And the real answer is... let's see who was closest!",
        "Time for the truth! How close were you?",
        "The actual percentage might surprise you."
    ],

    // SKILL SHOWDOWN
    SKILL_SHOWDOWN_SELECT: [
        "Skill Showdown! Precision meets pressure.",
        "This isn't about knowledge. This is about skill.",
        "Steady hands and sharp eyes. Skill Showdown time."
    ],
    SKILL_SHOWDOWN_REVEAL: [
        "Results are in! Let's see those scores.",
        "Time to judge your skills. No pressure.",
        "The leaderboard doesn't lie. How'd you do?"
    ],

    // AI MASHUP
    AI_MASHUP_SELECT: [
        "AI Mashup! The machine creates, you play.",
        "Time for the AI to torture you with a custom game.",
        "Feed me your ideas and I'll forge them into chaos."
    ],

    // ROAST MASTER
    ROAST_MASTER_SELECT: [
        "Roast Master! Prepare your burns.",
        "Time to roast your loved ones. Don't hold back.",
        "The inferno is about to begin. Choose your words wisely."
    ],

    // ROUND TRANSITIONS (used between rounds in any game)
    ROUND_TRANSITION: [
        "Next round! Stay on your toes.",
        "Moving right along!",
        "Round change! New opportunities await.",
        "Switching gears! Keep that energy up.",
        "On to the next one!"
    ],

    // GAME OVER (used when a game ends, before moving to next)
    GAME_OVER: [
        "And that's a wrap! Great game everyone.",
        "Game over! Let's see those final scores.",
        "That was something! Moving on to the next challenge.",
        "What a performance! The leaderboard has been updated.",
        "Finished! Some of you did great. Others... well, you tried."
    ],

    // CONTINUOUS MODE TRANSITIONS
    NEXT_GAME: [
        "On to the next game! The night is still young.",
        "Switching it up! New game incoming.",
        "That was just the warm-up. Here comes the next challenge!",
        "Don't get comfortable. Another game is loading!",
        "The gauntlet continues! Who's ready for more?"
    ],

    // GENERIC
    GENERIC_WIN: [
        "And the winner is... spectacular!",
        "Look at that score! Impressive.",
        "Not bad, not bad at all.",
        "Absolutely crushed it! Well played.",
        "Victory! Sweet, sweet victory."
    ],
    GENERIC_LOSE: [
        "Better luck next time.",
        "Oof, that was rough.",
        "Maybe practice a bit more?",
        "Not your finest hour, but there's always next round.",
        "The only way is up from here."
    ],
    GENERIC_CLOSE: [
        "That was close! What a nail-biter.",
        "Down to the wire! Incredible finish.",
        "Photo finish! Could've gone either way."
    ],
    GENERIC_TIMEOUT: [
        "Time's up! Pencils down!",
        "The clock has spoken. No more answers!",
        "That's time! Let's see what we've got."
    ]
};
