import { motion, AnimatePresence } from 'framer-motion';
import { Timer } from '../../components/Shared/Timer';

interface TriviaHostProps {
    question: string;
    answers: string[];
    timer: number;
    showResult: boolean;
    correctIndex: number;
}

const TriviaHost: React.FC<TriviaHostProps> = ({ question, answers, timer, showResult, correctIndex }) => {
    return (
        <div className="flex flex-col h-full w-full max-w-7xl justify-center items-center px-8 relative">
            <div className="absolute top-0 right-0 p-8">
                <Timer seconds={timer} total={30} />
            </div>

            <motion.div
                initial={{ y: -100, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                className="mb-20 text-center"
            >
                <div className="inline-block px-6 py-2 bg-game-primary/20 text-game-primary rounded-full text-xl font-black mb-6 uppercase tracking-[0.3em] border border-game-primary/30">
                    Trivia Time
                </div>
                <h2 className="text-[5rem] md:text-[7rem] font-black leading-[0.9] tracking-tighter max-w-6xl drop-shadow-2xl">
                    {question}
                </h2>
            </motion.div>

            <div className="grid grid-cols-2 gap-8 w-full">
                {answers.map((answer, i) => (
                    <motion.div
                        key={answer + i}
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{
                            scale: 1,
                            opacity: showResult && i !== correctIndex ? 0.3 : 1,
                            y: showResult && i === correctIndex ? -10 : 0,
                        }}
                        transition={{ delay: i * 0.1, type: "spring" }}
                        className={`p-12 rounded-[3rem] border-4 flex items-center justify-center text-4xl font-black relative overflow-hidden transition-all duration-500 ${
                            showResult && i === correctIndex 
                                ? 'bg-game-secondary text-game-bg border-white shadow-[0_0_80px_rgba(0,255,255,0.6)]' 
                                : 'bg-white/5 border-white/10 text-white'
                        }`}
                    >
                        {/* Option Letter */}
                        <div className={`absolute left-10 text-6xl opacity-10 font-black ${showResult && i === correctIndex ? 'text-black opacity-30' : ''}`}>
                            {['A', 'B', 'C', 'D'][i]}
                        </div>
                        
                        <span className="relative z-10 text-center">{answer}</span>

                        {showResult && i === correctIndex && (
                            <motion.div 
                                initial={{ scale: 0 }}
                                animate={{ scale: 1.5 }}
                                className="absolute -right-4 -top-4 text-6xl"
                            >
                                ✅
                            </motion.div>
                        )}
                    </motion.div>
                ))}
            </div>

            <AnimatePresence>
                {showResult && (
                    <motion.div
                        initial={{ scale: 0, rotate: -20 }}
                        animate={{ scale: 1, rotate: 0 }}
                        className="fixed bottom-32 left-1/2 -translate-x-1/2 bg-game-accent text-game-bg px-12 py-4 rounded-full text-4xl font-black shadow-[0_0_50px_rgba(254,211,48,0.5)] z-50 uppercase tracking-widest"
                    >
                        Correct Answer Revealed!
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default TriviaHost;