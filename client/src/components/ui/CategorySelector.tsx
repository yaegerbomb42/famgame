import React from 'react';
import { motion } from 'framer-motion';
import { GAME_CATALOG } from '../../data/gameCatalog';

interface CategorySelectorProps {
    playerCount: number;
    onSelect: (gameId: string) => void;
    pickWarning?: string;
}

const CategorySelector: React.FC<CategorySelectorProps> = ({ 
    playerCount, 
    onSelect,
    pickWarning 
}) => {
    return (
        <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="w-full h-full flex flex-col items-center p-6 md:p-12 min-h-0"
        >
            <div className="text-center mb-10">
                <motion.h2 
                    initial={{ scale: 0.9 }}
                    animate={{ scale: 1 }}
                    className="text-6xl md:text-8xl font-black mb-4 text-cyan-400 italic tracking-tighter uppercase drop-shadow-[0_0_30px_rgba(0,255,255,0.3)]"
                >
                    Select <span className="text-white">Game</span>
                </motion.h2>
                {pickWarning && (
                    <motion.p 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="text-sm font-black uppercase tracking-[0.3em] text-amber-400 bg-amber-400/10 px-6 py-2 rounded-full border border-amber-400/20 inline-block"
                    >
                        {pickWarning}
                    </motion.p>
                )}
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6 w-full max-w-7xl max-h-[65vh] overflow-y-auto pr-4 pb-12 custom-scrollbar">
                {GAME_CATALOG.map((g, idx) => {
                    const canPlay = playerCount >= (g.minPlayers || 1);
                    return (
                        <motion.button
                            key={g.id}
                            initial={{ opacity: 0, scale: 0.8, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            transition={{ delay: idx * 0.03 }}
                            whileHover={canPlay ? { y: -8, scale: 1.05, rotate: 1 } : {}}
                            whileTap={canPlay ? { scale: 0.95 } : {}}
                            onClick={() => canPlay && onSelect(g.id)}
                            className={`relative group rounded-[3rem] p-8 flex flex-col items-center gap-6 transition-all duration-300 border-4 ${
                                canPlay 
                                    ? 'bg-white/5 border-white/10 hover:border-cyan-400/50 hover:bg-cyan-400/5 shadow-xl hover:shadow-cyan-500/20' 
                                    : 'bg-white/5 border-white/5 opacity-30 grayscale cursor-not-allowed'
                            }`}
                        >
                            {/* Icon Container */}
                            <div className={`w-24 h-24 rounded-[2.5rem] flex items-center justify-center text-6xl transition-transform group-hover:scale-110 ${
                                canPlay ? 'bg-gradient-to-br from-white/10 to-transparent shadow-2xl' : 'bg-white/5'
                            }`}>
                                {g.icon}
                            </div>

                            {/* Name */}
                            <div className="text-center space-y-1">
                                <h3 className="text-xl font-black uppercase tracking-tight leading-none group-hover:text-cyan-400 transition-colors">
                                    {g.name}
                                </h3>
                                {!canPlay && (
                                    <p className="text-[10px] font-black text-pink-500 uppercase tracking-widest">
                                        Need {g.minPlayers} Players
                                    </p>
                                )}
                            </div>

                            {/* Hover "PLAY" Overlay */}
                            {canPlay && (
                                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-cyan-400/10 rounded-[2.8rem]">
                                    <div className="bg-cyan-400 text-black px-4 py-1 rounded-full font-black text-xs uppercase tracking-widest transform translate-y-12 group-hover:translate-y-24 transition-transform duration-500">
                                        SELECT
                                    </div>
                                </div>
                            )}

                            {/* Decorative Corner */}
                            <div className="absolute top-4 right-4 w-2 h-2 rounded-full bg-white/10 group-hover:bg-cyan-400 animate-pulse" />
                        </motion.button>
                    );
                })}
            </div>

            {/* Bottom Accent */}
            <div className="mt-8 flex items-center gap-4 text-white/20">
                <div className="h-px w-24 bg-current" />
                <span className="text-[10px] font-black uppercase tracking-[0.5em]">Game Library v1.0</span>
                <div className="h-px w-24 bg-current" />
            </div>
        </motion.div>
    );
};

export default CategorySelector;
