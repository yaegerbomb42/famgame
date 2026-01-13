import { motion } from 'framer-motion';

interface ReactionPlayerProps {
    phase: 'WAITING' | 'GO';
    onTap: () => void;
}

const ReactionPlayer: React.FC<ReactionPlayerProps> = ({ phase, onTap }) => {
    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            onClick={onTap}
            className={`flex-1 flex h-full items-center justify-center cursor-pointer transition-all duration-75 ${phase === 'GO' ? 'bg-green-500 shadow-[inset_0_0_100px_rgba(255,255,255,0.5)]' : 'bg-red-900 shadow-[inset_0_0_100px_rgba(0,0,0,0.5)]'}`}
        >
            {phase === 'WAITING' ? (
                <div className="text-center space-y-8 animate-pulse">
                    <div className="text-[10rem]">🛑</div>
                    <div className="text-6xl font-black uppercase tracking-[0.5em] text-red-400 drop-shadow-2xl">Wait for Green...</div>
                </div>
            ) : (
                <div className="text-center space-y-8">
                    <div className="text-[15rem] animate-bounce">🟢</div>
                    <div className="text-[12rem] font-black uppercase tracking-tighter text-white drop-shadow-huge leading-none">TAP NOW!!!</div>
                </div>
            )}
        </motion.div>
    );
};

export default ReactionPlayer;
