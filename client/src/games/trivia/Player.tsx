import { motion } from 'framer-motion';

interface TriviaPlayerProps {
    onAnswer: (index: number) => void;
    hasAnswered: boolean;
}

const TriviaPlayer: React.FC<TriviaPlayerProps> = ({ onAnswer, hasAnswered }) => {
    const colors = ['bg-red-500', 'bg-blue-500', 'bg-green-500', 'bg-yellow-500'];
    const labels = ['A', 'B', 'C', 'D'];

    if (hasAnswered) {
        return (
            <div className="flex-1 flex items-center justify-center">
                <h2 className="text-3xl font-bold animate-pulse">Waiting for others...</h2>
            </div>
        )
    }

    return (
        <div className="flex-1 grid grid-cols-2 gap-4 p-4">
            {colors.map((color, i) => (
                <motion.button
                    key={i}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => onAnswer(i)}
                    className={`${color} rounded-2xl flex items-center justify-center text-6xl font-black text-white shadow-lg`}
                >
                    {labels[i]}
                </motion.button>
            ))}
        </div>
    );
};

export default TriviaPlayer;
