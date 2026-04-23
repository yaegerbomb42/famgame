import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGameStore } from '../../store/useGameStore';
import { useSound } from '../../context/SoundContext';

const ReactionPlayer: React.FC = () => {
    const { socket, gameState } = useGameStore();
    const { playSuccess, playError } = useSound();
    
    const { phase, gameData } = (gameState as any) || {};
    const { active = false, submissions = {} } = gameData || {};
    const [localLocked, setLocalLocked] = React.useState(false);
    const hasTapped = localLocked || !!submissions[socket?.id || ''];
    const myResult = submissions[socket?.id || ''];

    React.useEffect(() => {
        if (phase !== 'PLAYING') {
            setLocalLocked(false);
        }
    }, [phase]);

    const handleTap = () => {
        if (hasTapped || phase !== 'PLAYING') return;
        setLocalLocked(true);
        
        socket?.emit('gameInput', { 
            action: 'tap'
        });
        
        if (!active) {
            playError();
            if (navigator.vibrate) navigator.vibrate([100, 50, 100]);
        } else {
            playSuccess();
            if (navigator.vibrate) navigator.vibrate(30);
        }
    };

    if (phase === 'INTRO' || phase === 'COUNTDOWN') {
        return (
            <div className="flex-1 flex flex-col items-center justify-center p-8 text-center space-y-12 bg-[#0d0f1a]">
                <div className="text-[12rem] animate-pulse">⚡</div>
                <div className="text-center space-y-4">
                    <h2 className="text-7xl font-black text-white uppercase italic tracking-tighter italic text-center">
                        LIGHTNING REACT
                    </h2>
                    <p className="text-2xl text-[#00ffff] font-black uppercase tracking-widest animate-pulse">
                        READY YOUR FINGERS
                    </p>
                </div>
            </div>
        );
    }

    if (phase === 'REVEAL') {
        const isEarly = myResult === -1;
        const isSuccess = myResult > 0;

        return (
            <div className="flex-1 flex flex-col items-center justify-center p-8 space-y-10 bg-[#0d0f1a]">
                <motion.div
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className={`p-12 rounded-[4rem] border-8 text-center space-y-8 w-full ${
                        isEarly ? 'border-[#ff00ff] bg-[#ff00ff]/10 shadow-[0_0_50px_rgba(255,0,255,0.3)]' :
                        isSuccess ? 'border-[#00ff00] bg-[#00ff00]/10 shadow-[0_0_50px_rgba(0,255,0,0.3)]' :
                        'border-white/10 bg-white/5'
                    }`}
                >
                    <div className="text-[10rem]">
                        {isEarly ? '🐢' : isSuccess ? '⚡' : '😴'}
                    </div>
                    <h2 className={`text-6xl font-black uppercase tracking-tighter italic ${
                        isEarly ? 'text-[#ff00ff]' : isSuccess ? 'text-[#00ff00]' : 'text-white/40'
                    }`}>
                        {isEarly ? 'TOO EARLY!' : isSuccess ? 'NICE REFLEXES!' : 'MISSED IT!'}
                    </h2>
                    {isSuccess && (
                        <div className="space-y-2">
                            <div className="text-8xl font-black text-white font-mono">{myResult}ms</div>
                        </div>
                    )}
                </motion.div>
                <p className="text-2xl text-white/20 font-black uppercase tracking-widest animate-pulse">Check the Big Screen</p>
            </div>
        );
    }

    return (
        <div className={`flex-1 flex flex-col transition-colors duration-200 ${active ? 'bg-[#00ff00]' : 'bg-[#0d0f1a]'}`}>
            <button
                onPointerDown={handleTap}
                disabled={hasTapped}
                className={`
                    w-full h-full flex flex-col items-center justify-center p-8 outline-none
                    ${hasTapped ? (myResult === -1 ? 'bg-[#ff00ff]/20' : 'bg-[#00ff00]/20') : 'bg-transparent'}
                `}
            >
                <AnimatePresence mode="wait">
                    {!hasTapped ? (
                        <motion.div
                            key="waiting"
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 1.2 }}
                            className="flex flex-col items-center"
                        >
                            <div className={`text-[15rem] mb-12 ${active ? 'animate-bounce' : 'animate-pulse'}`}>
                                {active ? '🟢' : '🔴'}
                            </div>
                            <h2 className={`text-[8rem] font-black italic tracking-tighter uppercase leading-none ${active ? 'text-[#0d0f1a]' : 'text-white'}`}>
                                {active ? 'TAP!' : 'WAIT...'}
                            </h2>
                        </motion.div>
                    ) : (
                        <motion.div
                            key="locked"
                            initial={{ scale: 0.5, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            className="flex flex-col items-center"
                        >
                            <div className="text-[12rem] mb-8">
                                {myResult === -1 ? '🤡' : '🎯'}
                            </div>
                            <h2 className={`text-6xl font-black uppercase tracking-tighter italic ${myResult === -1 ? 'text-[#ff00ff]' : 'text-[#ffff00]'}`}>
                                {myResult === -1 ? 'TOO EAGER!' : 'LOCKED IN'}
                            </h2>
                        </motion.div>
                    )}
                </AnimatePresence>
            </button>
        </div>
    );
};

export default ReactionPlayer;