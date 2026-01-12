import { useState } from 'react';

interface MindMeldPlayerProps {
    phase: 'PROMPT' | 'ANSWERING' | 'MATCHING' | 'RESULTS';
    prompt: string;
    timer: number;
    onSubmitAnswer: (answer: string) => void;
}

const MindMeldPlayer = ({ phase, prompt, timer, onSubmitAnswer }: MindMeldPlayerProps) => {
    const [answer, setAnswer] = useState('');
    const [submitted, setSubmitted] = useState(false);

    const handleSubmit = () => {
        if (answer.trim() && !submitted) {
            setSubmitted(true);
            onSubmitAnswer(answer.trim());
        }
    };

    return (
        <div className="flex-1 flex flex-col items-center justify-center p-6">
            {phase === 'PROMPT' && (
                <div className="text-center">
                    <div className="text-6xl mb-4">🧠💫</div>
                    <h2 className="text-2xl font-bold">Mind Meld</h2>
                    <p className="text-white/50 mt-2">Think alike to win!</p>
                </div>
            )}

            {phase === 'ANSWERING' && !submitted && (
                <div className="w-full max-w-sm text-center">
                    <div className={`text-5xl font-black mb-4 ${timer <= 5 ? 'text-red-500 animate-pulse' : ''}`}>
                        {timer}
                    </div>

                    <h2 className="text-xl font-bold mb-6">{prompt}</h2>

                    <input
                        type="text"
                        value={answer}
                        onChange={(e) => setAnswer(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
                        placeholder="Your answer..."
                        className="w-full p-4 text-xl bg-white/10 rounded-xl mb-4 text-center"
                        autoFocus
                        autoComplete="off"
                    />

                    <button
                        onClick={handleSubmit}
                        disabled={!answer.trim()}
                        className="w-full py-4 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl font-bold text-xl disabled:opacity-50"
                    >
                        Lock In Answer
                    </button>

                    <p className="text-sm text-white/40 mt-4">Think like others to match!</p>
                </div>
            )}

            {phase === 'ANSWERING' && submitted && (
                <div className="text-center">
                    <div className="text-6xl mb-4">✓</div>
                    <p className="text-xl text-green-400">Answer submitted!</p>
                    <p className="text-white/50 mt-2">Waiting for others...</p>
                </div>
            )}

            {phase === 'MATCHING' && (
                <div className="text-center">
                    <div className="text-6xl mb-4 animate-spin">🔮</div>
                    <p className="text-xl text-white/50">Finding matches...</p>
                </div>
            )}

            {phase === 'RESULTS' && (
                <div className="text-center">
                    <div className="text-6xl mb-4">✨</div>
                    <p className="text-xl">Check the TV for matches!</p>
                </div>
            )}
        </div>
    );
};

export default MindMeldPlayer;
