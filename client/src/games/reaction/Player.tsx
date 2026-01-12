

interface ReactionPlayerProps {
    phase: 'WAITING' | 'GO';
    onTap: () => void;
}

const ReactionPlayer: React.FC<ReactionPlayerProps> = ({ phase, onTap }) => {
    return (
        <div
            onClick={onTap}
            className={`flex-1 flex h-full items-center justify-center cursor-pointer transition-colors duration-0 ${phase === 'GO' ? 'bg-green-500' : 'bg-red-900'}`}
        >
            {phase === 'WAITING' ? (
                <div className="text-3xl font-bold uppercase tracking-widest text-red-400">Wait for Green</div>
            ) : (
                <div className="text-6xl font-black uppercase tracking-widest text-white">TAP NOW!</div>
            )}
        </div>
    );
};

export default ReactionPlayer;
