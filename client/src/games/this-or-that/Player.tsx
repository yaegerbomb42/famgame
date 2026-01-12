import { useState } from 'react';

interface ThisOrThatPlayerProps {
    phase: 'CHOOSING' | 'RESULTS';
    optionA: string;
    optionB: string;
    onVote: (choice: 'A' | 'B') => void;
}

const ThisOrThatPlayer = ({ phase, optionA, optionB, onVote }: ThisOrThatPlayerProps) => {
    const [voted, setVoted] = useState(false);

    const handleVote = (choice: 'A' | 'B') => {
        if (!voted) {
            setVoted(true);
            onVote(choice);
        }
    };

    return (
        <div className="flex-1 flex flex-col items-center justify-center p-6">
            {phase === 'CHOOSING' && !voted && (
                <div className="w-full max-w-md">
                    <h2 className="text-2xl font-bold text-center mb-8">Pick one!</h2>

                    <div className="flex flex-col gap-4">
                        <button
                            onClick={() => handleVote('A')}
                            className="w-full py-8 px-6 glass-card rounded-2xl text-center hover:bg-game-primary/20 hover:border-game-primary transition-all active:scale-95"
                        >
                            <span className="text-4xl block mb-2">{optionA.split(' ')[0]}</span>
                            <span className="text-xl font-bold">{optionA}</span>
                        </button>

                        <div className="text-center text-white/30 font-bold">OR</div>

                        <button
                            onClick={() => handleVote('B')}
                            className="w-full py-8 px-6 glass-card rounded-2xl text-center hover:bg-game-secondary/20 hover:border-game-secondary transition-all active:scale-95"
                        >
                            <span className="text-4xl block mb-2">{optionB.split(' ')[0]}</span>
                            <span className="text-xl font-bold">{optionB}</span>
                        </button>
                    </div>
                </div>
            )}

            {(phase === 'CHOOSING' && voted) && (
                <div className="text-center">
                    <div className="text-6xl mb-4">✓</div>
                    <p className="text-xl text-game-secondary">Vote locked in!</p>
                </div>
            )}

            {phase === 'RESULTS' && (
                <div className="text-center">
                    <div className="text-6xl mb-4">👀</div>
                    <p className="text-xl">Check the TV for results!</p>
                </div>
            )}
        </div>
    );
};

export default ThisOrThatPlayer;
