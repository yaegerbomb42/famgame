import { useState, useEffect, useRef } from 'react';
import { useGameStore } from '../store/useGameStore';
import { motion, AnimatePresence } from 'framer-motion';
import { useSound } from '../context/SoundContext';

// Extended Avatar List
const AVATARS = [
    '🙂', '😂', '😎', '🤔', '😍', '🤩', '🤯', '🥳',
    '👻', '👽', '🤖', '💩', '🐱', '🐶', '🦄', '🐲',
    '🦊', '🦁', '🐸', '🐙', '🦋', '🐞', '🦀', '🦈',
    '🦍', '🐘', '🦒', '🦓', '🐪', '🦘', '🦛', '🦏',
    '🚗', '🚀', '⛵', '✈️', '🎪', '🎭', '🎨', '🎸',
    '🍕', '🍔', '🍟', '🌭', '🍬', '🍭', '🍩', '🍪',
    '🏀', '⚽', '🏈', '🎾', '🎱', '🎳', '🎲', '🎮'
];

// Vibrant neon colors
const COLORS = [
    '#EF4444', // Red
    '#F97316', // Orange
    '#F59E0B', // Amber
    '#EAB308', // Yellow
    '#84CC16', // Lime
    '#22C55E', // Green
    '#10B981', // Emerald
    '#14B8A6', // Teal
    '#06B6D4', // Cyan
    '#0EA5E9', // Sky
    '#3B82F6', // Blue
    '#6366F1', // Indigo
    '#8B5CF6', // Violet
    '#A855F7', // Purple
    '#D946EF', // Fuchsia
    '#EC4899', // Pink
];

const PlayerLogic = () => {
    const { gameState, isConnected, socket, joinRoom, initSocket } = useGameStore();
    const { playClick, playSuccess, playError } = useSound();

    const [joinStep, setJoinStep] = useState<'CODE' | 'DETAILS'>('CODE');
    const [roomCode, setRoomCode] = useState('');
    const [name, setName] = useState('');
    const [avatar, setAvatar] = useState('🙂');
    const [color, setColor] = useState(COLORS[8]); // Default Cyan
    const [hasJoined, setHasJoined] = useState(false);

    const autoFillAttempted = useRef(false);

    useEffect(() => {
        initSocket();
    }, [initSocket]);

    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        const code = params.get('code');
        if (code && code.length === 4 && !autoFillAttempted.current) {
            autoFillAttempted.current = true;
            setTimeout(() => {
                setRoomCode(code.toUpperCase());
                setJoinStep('DETAILS');
            }, 0);
        }
    }, []);

    const handleJoin = (e: React.FormEvent) => {
        e.preventDefault();
        if (!name.trim()) {
            playError();
            return;
        }
        joinRoom(name, roomCode.toUpperCase(), avatar, color);
        setHasJoined(true);
        playSuccess();
    };

    if (!isConnected) {
        return (
            <div className="fixed inset-0 bg-game-bg flex flex-col items-center justify-center p-8 text-center space-y-6">
                <motion.div
                    animate={{ scale: [1, 1.2, 1], rotate: [0, 10, -10, 0] }}
                    transition={{ repeat: Infinity, duration: 2 }}
                    className="text-6xl"
                >
                    📡
                </motion.div>
                <p className="text-xl font-black tracking-[0.3em] text-game-secondary animate-pulse">CONNECTING TO GAME NIGHT...</p>
            </div>
        )
    }

    if (hasJoined && gameState) {
        const me = gameState.players[socket?.id || ''];
        if (!me) return (
            <div className="fixed inset-0 bg-game-bg flex items-center justify-center">
                <p className="text-white/20 font-black text-2xl animate-pulse uppercase tracking-widest">Joining room...</p>
            </div>
        );

        // Dynamic background based on player color
        const bgStyle = {
            backgroundImage: `radial-gradient(circle at 50% 10%, ${color}20 0%, transparent 70%)`
        };

        return (
            <div className="fixed inset-0 bg-game-bg flex flex-col overflow-hidden font-sans" style={bgStyle}>
                {/* Mobile Header */}
                <header className="p-4 flex justify-between items-center bg-white/5 border-b border-white/10 z-50 backdrop-blur-md">
                    <div className="flex items-center gap-4">
                        <div className="text-4xl transform -rotate-12 filter drop-shadow-lg">{me.avatar}</div>
                        <div className="flex flex-col">
                            <span className="text-[10px] font-black uppercase text-white/30 tracking-widest">Player</span>
                            <span className="font-black text-xl leading-none truncate max-w-[150px]" style={{ color: me.color || '#fff' }}>{me.name}</span>
                        </div>
                    </div>
                </header>

                <main className="flex-1 relative p-6 flex flex-col overflow-hidden">
                    <AnimatePresence mode='wait'>
                        {gameState.status === 'LOBBY' && (
                            <motion.div
                                key="lobby"
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 1.1 }}
                                className="flex-1 flex flex-col items-center justify-center space-y-8 text-center"
                            >
                                <div className="text-[8rem] animate-bounce-slow filter drop-shadow-2xl">{me.avatar}</div>
                                <h2 className="text-4xl font-black uppercase tracking-tighter">
                                    You're <span style={{ color: me.color }}>IN!</span>
                                </h2>
                                <p className="text-white/40 text-lg font-medium max-w-[280px]">
                                    Look at the <span className="text-white">Big Screen</span>.
                                </p>
                            </motion.div>
                        )}

                        {gameState.status === 'GAME_SELECT' && (
                            <motion.div
                                key="select"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                className="flex-1 flex flex-col items-center justify-center p-4 text-center space-y-8"
                            >
                                <div className="text-8xl animate-pulse grayscale opacity-50">🕹️</div>
                                <div>
                                    <h2 className="text-3xl font-black uppercase tracking-tighter mb-2" style={{ color: me.color }}>Game Night</h2>
                                    <p className="text-white/40 text-lg font-medium">
                                        Waiting for Host to start a game...
                                    </p>
                                </div>
                            </motion.div>
                        )}

                        {/* Placeholder for other states if needed */}
                        {gameState.status === 'PLAYING' && (
                            <div className="flex flex-col items-center justify-center h-full text-center">
                                <h1 className="text-2xl font-bold animate-pulse">Game in Progress...</h1>
                                <p className="text-white/50">Look at the TV!</p>
                            </div>
                        )}
                    </AnimatePresence>
                </main>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-game-bg flex items-center justify-center p-4">
            <AnimatePresence mode="wait">
                {joinStep === 'CODE' ? (
                    <motion.form key="code"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        onSubmit={(e) => { e.preventDefault(); if (roomCode.length === 4) { playClick(); setJoinStep('DETAILS'); } }}
                        className="w-full max-w-md space-y-8"
                    >
                        <div className="text-center space-y-2">
                            <h1 className="text-4xl font-black uppercase tracking-tighter">
                                Game<span className="text-transparent bg-clip-text bg-gradient-to-r from-game-primary to-game-secondary">Night</span>
                            </h1>
                            <p className="text-white/40 font-bold uppercase tracking-widest text-sm">Enter Room Code</p>
                        </div>

                        <input
                            type="text"
                            value={roomCode}
                            onChange={(e) => setRoomCode(e.target.value.toUpperCase().slice(0, 4))}
                            placeholder="ABCD"
                            className="w-full bg-white/5 border-2 border-white/10 rounded-2xl p-8 text-center text-5xl font-mono font-bold tracking-[0.5em] focus:outline-none focus:border-game-primary transition-all placeholder:text-white/10 uppercase"
                            autoFocus
                        />

                        <button
                            type="submit"
                            disabled={roomCode.length !== 4}
                            className="w-full py-6 rounded-2xl bg-gradient-to-r from-game-primary to-game-secondary font-black text-xl uppercase tracking-widest disabled:opacity-50 disabled:cursor-not-allowed transform active:scale-95 transition-all shadow-lg hover:shadow-game-primary/25"
                        >
                            Next Step
                        </button>
                    </motion.form>
                ) : (
                    <motion.form key="details"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        onSubmit={handleJoin}
                        className="w-full max-w-md space-y-6"
                    >
                        <div className="text-center">
                            <span className="bg-white/10 px-4 py-1 rounded-full text-xs font-mono text-white/50">ROOM: {roomCode}</span>
                        </div>

                        <div className="grid grid-cols-[auto_1fr] gap-4">
                            <div
                                className="w-24 h-24 rounded-2xl flex items-center justify-center text-5xl shadow-inner border-2 transition-colors"
                                style={{ backgroundColor: `${color}20`, borderColor: color }}
                            >
                                {avatar}
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-bold uppercase tracking-widest text-white/40 ml-1">Your Name</label>
                                <input
                                    type="text"
                                    value={name}
                                    onChange={(e) => setName(e.target.value.slice(0, 12))}
                                    placeholder="ENTER NAME"
                                    className="w-full h-16 bg-white/5 border-2 border-white/10 rounded-xl px-6 text-xl font-bold focus:outline-none focus:border-game-primary transition-all placeholder:text-white/10 uppercase"
                                    autoFocus
                                />
                            </div>
                        </div>

                        {/* Color Picker Swatches */}
                        <div className="space-y-2">
                            <label className="text-xs font-bold uppercase tracking-widest text-white/40 ml-1">Identity Color</label>
                            <div className="flex flex-wrap gap-2 justify-between">
                                {COLORS.map((c) => (
                                    <button
                                        key={c}
                                        type="button"
                                        onClick={() => { playClick(); setColor(c); }}
                                        className={`w-8 h-8 rounded-full border-2 transition-transform hover:scale-110 ${color === c ? 'border-white scale-110' : 'border-transparent'}`}
                                        style={{ backgroundColor: c, boxShadow: color === c ? `0 0 10px ${c}` : 'none' }}
                                    />
                                ))}
                            </div>
                        </div>

                        {/* Avatar Grid */}
                        <div className="space-y-2">
                            <label className="text-xs font-bold uppercase tracking-widest text-white/40 ml-1">Choose Avatar</label>
                            <div className="bg-white/5 rounded-2xl p-4 h-48 overflow-y-auto grid grid-cols-6 gap-2 border border-white/10">
                                {AVATARS.map((a) => (
                                    <button
                                        key={a}
                                        type="button"
                                        onClick={() => { playClick(); setAvatar(a); }}
                                        className={`aspect-square flex items-center justify-center text-2xl rounded-lg transition-colors ${avatar === a ? 'bg-white/20 scale-110' : 'hover:bg-white/10'}`}
                                    >
                                        {a}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="flex gap-4 pt-4">
                            <button
                                type="button"
                                onClick={() => { playClick(); setJoinStep('CODE'); }}
                                className="px-6 py-4 rounded-xl bg-white/5 font-bold text-white/50 hover:bg-white/10 transition-colors"
                            >
                                BACK
                            </button>
                            <button
                                type="submit"
                                disabled={!name.trim()}
                                className="flex-1 py-4 rounded-xl bg-gradient-to-r from-game-primary to-game-secondary font-black text-xl uppercase tracking-widest disabled:opacity-50 disabled:cursor-not-allowed transform active:scale-95 transition-all shadow-lg hover:shadow-game-primary/25"
                            >
                                JOIN PARTY
                            </button>
                        </div>
                    </motion.form>
                )}
            </AnimatePresence>
        </div>
    );
};

export default PlayerLogic;