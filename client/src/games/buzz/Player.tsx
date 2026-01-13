import { motion } from 'framer-motion';

interface BuzzPlayerProps {
    phase: 'WAITING' | 'ACTIVE' | 'BUZZED';
    onBuzz: () => void;
}

const BuzzPlayer: React.FC<BuzzPlayerProps> = ({ phase, onBuzz }) => {

    return (
        <div className="flex-1 flex flex-col items-center justify-center p-8 w-full max-w-4xl mx-auto">
            {phase === 'WAITING' && (
                <div className="text-center space-y-8 opacity-40">
                    <div className="text-huge animate-pulse">🤫</div>
                    <div className="text-4xl font-black uppercase tracking-[0.3em]">Wait for the signal...</div>
                </div>
            )}

            {phase === 'ACTIVE' && (
                <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.85 }}
                    onClick={() => {
                        if (navigator.vibrate) navigator.vibrate([100, 50, 100]);
                        onBuzz();
                    }}
                    className="w-[30rem] h-[30rem] rounded-full bg-red-600 border-[1rem] border-red-800 shadow-[0_0_100px_rgba(220,38,38,0.8)] flex items-center justify-center cursor-pointer active:bg-red-700 transition-all border-t-[1.5rem] border-white/20"
                >
                    <span className="text-8xl font-black text-white drop-shadow-huge tracking-tighter uppercase">BUZZ!</span>
                </motion.button>
            )}

            {phase === 'BUZZED' && (
                <div className="text-center space-y-8">
                    <div className="text-huge animate-bounce">⚡</div>
                    <div className="text-7xl font-black text-white gradient-text-primary uppercase tracking-widest shadow-glow">LOCKED IN!</div>
                    <p className="text-2xl font-black text-white/40 uppercase tracking-widest">You were fast!</p>
                </div>
            )}
        </div>
    );
};

export default BuzzPlayer;
