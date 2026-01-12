import { motion } from 'framer-motion';

interface BuzzPlayerProps {
    phase: 'WAITING' | 'ACTIVE' | 'BUZZED';
    onBuzz: () => void;
}

const BuzzPlayer: React.FC<BuzzPlayerProps> = ({ phase, onBuzz }) => {

    return (
        <div className="flex flex-col h-full items-center justify-center p-8">
            {phase === 'WAITING' && (
                <div className="text-2xl text-white/50 text-center">Wait for the signal...</div>
            )}

            {phase === 'ACTIVE' && (
                <motion.button
                    whileTap={{ scale: 0.9 }}
                    onClick={() => {
                        // Haptic if available
                        if (navigator.vibrate) navigator.vibrate(200);
                        onBuzz();
                    }}
                    className="w-64 h-64 rounded-full bg-red-600 border-8 border-red-800 shadow-[0_0_50px_rgba(220,38,38,0.5)] flex items-center justify-center cursor-pointer active:bg-red-700 transition-colors"
                >
                    <span className="text-4xl font-black text-white drop-shadow-md">BUZZ!</span>
                </motion.button>
            )}

            {phase === 'BUZZED' && (
                <div className="text-4xl font-bold text-white">LOCKED</div>
            )}
        </div>
    );
};

export default BuzzPlayer;
