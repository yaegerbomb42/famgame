import { motion } from 'framer-motion';

interface TriviaHostProps {
    question: string;
    answers: string[];
    timer: number;
    showResult: boolean;
    correctIndex: number;
}

const TriviaHost: React.FC<TriviaHostProps> = ({ question, answers, timer, showResult, correctIndex }) => {
    return (
        <div className="flex flex-col h-full justify-center items-center p-8">
            <motion.div
                initial={{ y: -50, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                className="mb-12 text-center"
            >
                <div className="text-2xl text-game-accent font-bold mb-4 tracking-widest uppercase">Trivia</div>
                <h2 className="text-6xl font-display leading-tight max-w-5xl">{question}</h2>
            </motion.div>

            <div className="grid grid-cols-2 gap-6 w-full max-w-6xl">
                {answers.map((answer, i) => (
                    <motion.div
                        key={i}
                        initial={{ scale: 0.9, opacity: 0 }}
                        animate={{
                            scale: 1,
                            opacity: showResult && i !== correctIndex ? 0.3 : 1,
                            backgroundColor: showResult && i === correctIndex ? '#00ccff' : 'rgba(255,255,255,0.05)'
                        }}
                        transition={{ delay: i * 0.1 }}
                        className={`p-8 rounded-2xl border-2 border-white/10 flex items-center justify-center text-3xl font-bold relative overflow-hidden ${showResult && i === correctIndex ? 'text-black border-game-secondary' : 'text-white'
                            }`}
                    >
                        {/* Option Letter */}
                        <div className="absolute left-6 opacity-20 text-4xl">{['A', 'B', 'C', 'D'][i]}</div>
                        {answer}
                    </motion.div>
                ))}
            </div>

            <div className="mt-12 w-full max-w-4xl h-4 bg-white/10 rounded-full overflow-hidden">
                <motion.div
                    className="h-full bg-game-primary"
                    initial={{ width: '100%' }}
                    animate={{ width: `${(timer / 30) * 100}%` }}
                    transition={{ ease: "linear", duration: 1 }} // Smooth steps if timer updates every sec
                />
            </div>
        </div>
    );
};

export default TriviaHost;
