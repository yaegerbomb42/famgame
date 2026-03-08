import { motion } from 'framer-motion';

interface TimerProps {
    seconds: number;
    total?: number;
}

export const Timer = ({ seconds, total = 30 }: TimerProps) => {
    const percentage = (seconds / total) * 100;
    const isLow = seconds <= 5;

    return (
        <div className="relative flex flex-col items-center">
            <div className="relative w-32 h-32 flex items-center justify-center">
                {/* Background Ring */}
                <svg className="absolute inset-0 w-full h-full transform -rotate-90">
                    <circle
                        cx="64"
                        cy="64"
                        r="58"
                        stroke="currentColor"
                        strokeWidth="8"
                        fill="transparent"
                        className="text-white/10"
                    />
                    <motion.circle
                        cx="64"
                        cy="64"
                        r="58"
                        stroke="currentColor"
                        strokeWidth="8"
                        fill="transparent"
                        strokeDasharray="364"
                        initial={{ strokeDashoffset: 0 }}
                        animate={{ strokeDashoffset: 364 - (364 * percentage) / 100 }}
                        className={isLow ? 'text-red-500' : 'text-game-secondary'}
                        transition={{ duration: 1, ease: "linear" }}
                    />
                </svg>
                
                <motion.span 
                    key={seconds}
                    initial={{ scale: 1.5, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className={`text-5xl font-black tabular-nums ${isLow ? 'text-red-500 animate-pulse' : 'text-white'}`}
                >
                    {seconds}
                </motion.span>
            </div>
            
            {isLow && (
                <motion.p 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mt-2 text-red-500 font-black uppercase tracking-widest text-sm"
                >
                    Hurry Up!
                </motion.p>
            )}
        </div>
    );
};
