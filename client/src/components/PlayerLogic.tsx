import { useState, useEffect, useRef } from 'react';
import { useGameStore } from '../store/useGameStore';
import { motion, AnimatePresence } from 'framer-motion';
import { useSound } from '../context/SoundContext';

// Game Player Components
import { PLAYER_COMPONENTS } from '../games/gameRegistry';


const AVATARS = [
    '🙂', '😂', '😎', '🤔', '😍', '🤩', '🤯', '🥳',
    '👻', '👽', '🤖', '💩', '🐱', '🐶', '🦄', '🐲',
    '🦊', '🦁', '🐸', '🐙', '🦋', '🐞', '🦀', '🦈',
    '🦍', '🐘', '🦒', '🦓', '🐪', '🦘', '🦛', '🦏',
    '🚗', '🚀', '⛵', '✈️', '🎪', '🎭', '🎨', '🎸',
    '🍕', '🍔', '🍟', '🌭', '🍬', '🍭', '🍩', '🍪',
    '🏀', '⚽', '🏈', '🎾', '🎱', '🎳', '🎲', '🎮'
];

const COLORS = [
    '#FF00FF', '#00FFFF', '#FFFF00', '#00FF00', '#FF6BFF', 
    '#00FFCC', '#FFCC00', '#FF00CC', '#00FF99', '#FF9900', 
    '#CC00FF', '#00CCFF', '#FF0066', '#66FF00', '#FF66CC', '#66FFFF'
];

const AutoScrollingLeaderboard = ({ players, myId }: { players: any[], myId: string }) => {
    const scrollRef = useRef<HTMLDivElement>(null);
    const sorted = [...players].sort((a, b) => b.score - a.score);

    useEffect(() => {
        const el = scrollRef.current;
        if (!el || sorted.length < 6) return;

        let scrollAmount = 0;
        const speed = 0.5;
        const interval = setInterval(() => {
            scrollAmount += speed;
            if (scrollAmount >= el.scrollHeight - el.clientHeight) {
                setTimeout(() => { scrollAmount = 0; el.scrollTop = 0; }, 2000);
            } else {
                el.scrollTop = scrollAmount;
            }
        }, 30);
        return () => clearInterval(interval);
    }, [sorted.length]);

    return (
        <div ref={scrollRef} className="h-full w-full overflow-y-auto scrollbar-hide py-4 space-y-3 px-4">
            {sorted.map((p, i) => (
                <div 
                    key={p.id} 
                    className={`flex items-center gap-4 p-4 rounded-2xl border-2 transition-all ${
                        p.id === myId 
                            ? 'bg-cyan-500/10 border-cyan-400/50 scale-[1.02] shadow-[0_0_20px_rgba(0,255,255,0.1)]' 
                            : 'bg-white/5 border-white/5'
                    }`}
                >
                    <div className={`text-2xl font-black w-10 ${i < 3 ? 'text-yellow-400' : 'text-white/20'}`}>#{i + 1}</div>
                    <div className="text-3xl">{p.avatar}</div>
                    <div className="flex-1 text-left">
                        <div className="text-xl font-black uppercase tracking-tighter truncate">{p.name}</div>
                        {p.id === myId && <div className="text-[8px] font-black text-cyan-400 uppercase tracking-widest">You</div>}
                    </div>
                    <div className="text-2xl font-black tabular-nums">{p.score}</div>
                </div>
            ))}
        </div>
    );
};

const PlayerLogic = () => {
    const { gameState, isConnected, socket, joinRoom, initSocket } = useGameStore();
    const { playClick, playSuccess, playError } = useSound();

    const [joinStep, setJoinStep] = useState<'CODE' | 'DETAILS'>('CODE');
    const [roomCode, setRoomCode] = useState('');
    const [name, setName] = useState('');
    const [avatar, setAvatar] = useState('🙂');
    const [color, setColor] = useState(COLORS[1]);
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

    // BOT AUTO-JOIN
    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        const isBot = params.get('bot') === 'true';
        const botId = params.get('botId') || '1';
        const code = params.get('code');

        if (isBot && code && isConnected && !hasJoined) {
            console.log('🤖 Bot initializing join...');
            setTimeout(() => {
                setRoomCode(code);
                setName(`BOT_${botId}`);
                setAvatar(AVATARS[Math.floor(Math.random() * AVATARS.length)]);
                setColor(COLORS[Math.floor(Math.random() * COLORS.length)]);
                
                setTimeout(() => {
                    joinRoom(`BOT_${botId}`, code, AVATARS[Math.floor(Math.random() * AVATARS.length)], COLORS[Math.floor(Math.random() * COLORS.length)]);
                    setHasJoined(true);
                }, 500);
            }, 500);
        }
    }, [isConnected, hasJoined, joinRoom]);

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
            <div className="fixed inset-0 bg-[#0d0f1a] flex flex-col items-center justify-center p-8 text-center space-y-8 font-['Outfit']">
                <div className="w-24 h-24 rounded-3xl bg-white/5 flex items-center justify-center text-6xl animate-pulse">
                    <div className="text-cyan-400 drop-shadow-[0_0_20px_rgba(0,255,255,0.7)]">📡</div>
                </div>
                <div className="space-y-4">
                    <p className="text-5xl font-black tracking-tighter text-white">CONNECTING...</p>
                    <p className="text-white/30 font-black uppercase tracking-[0.5em] text-sm animate-pulse">ESTABLISHING UPLINK</p>
                </div>
            </div>
        )
    }

    if (hasJoined && gameState) {
        const me = gameState.players[socket?.id || ''];
        if (!me) return (
            <div className="fixed inset-0 bg-[#0d0f1a] flex items-center justify-center font-['Outfit']">
                <div className="flex flex-col items-center gap-6">
                    <div className="w-20 h-20 border-8 border-white/5 border-t-cyan-400 rounded-full animate-spin drop-shadow-[0_0_20px_rgba(0,255,255,0.5)]" />
                    <p className="text-white/30 font-black uppercase tracking-[0.5em] text-sm">SYNCHRONIZING...</p>
                </div>
            </div>
        );

        return (
            <div className="fixed inset-0 bg-[#0d0f1a] text-white flex flex-col overflow-hidden font-['Outfit']">
                <header className="p-6 flex justify-between items-center bg-white/[0.04] border-b border-white/10 z-50 backdrop-blur-2xl">
                    <div className="flex items-center gap-5">
                        <div 
                            className="w-16 h-16 rounded-[1.5rem] flex items-center justify-center text-4xl shadow-2xl border-2"
                            style={{ 
                                backgroundColor: `${me.color}20`, 
                                borderColor: me.color,
                                boxShadow: `0 0 25px ${me.color}40`
                            }}
                        >
                            {me.avatar}
                        </div>
                        <div className="flex flex-col">
                            <span className="text-[10px] font-black uppercase text-white/30 tracking-[0.3em] leading-tight">MEMBER</span>
                            <span className="font-black text-2xl leading-none truncate max-w-[150px] italic tracking-tighter">{me.name}</span>
                        </div>
                    </div>
                    <div className="px-6 py-3 rounded-3xl bg-white/5 border border-white/10 flex items-center gap-3 shadow-inner">
                        <div className="w-3 h-3 rounded-full bg-cyan-500 animate-pulse shadow-[0_0_10px_rgba(0,255,255,0.5)]" />
                        <span className="text-sm font-black uppercase tracking-widest">{gameState.roomCode}</span>
                    </div>
                </header>

                <main className="flex-1 relative p-6 flex flex-col overflow-hidden bg-[radial-gradient(circle_at_50%_50%,rgba(0,255,255,0.05),transparent)]">
                    <AnimatePresence mode='wait'>
                        {gameState.status === 'LOBBY' && (
                            <motion.div
                                key="lobby"
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="flex-1 flex flex-col items-center justify-center space-y-12 text-center"
                            >
                                <div className="relative">
                                    <div className="text-[15rem] drop-shadow-[0_0_50px_rgba(255,255,255,0.2)] z-10 relative">{me.avatar}</div>
                                    <motion.div 
                                        animate={{ scale: [1, 1.5, 1], opacity: [0.2, 0.4, 0.2] }}
                                        transition={{ repeat: Infinity, duration: 4 }}
                                        className="absolute inset-x-0 -inset-y-10 blur-3xl rounded-full -z-10"
                                        style={{ backgroundColor: me.color }}
                                    />
                                </div>
                                <div className="space-y-4">
                                    <h2 className="text-8xl font-black bg-gradient-to-r from-cyan-400 via-white to-pink-400 bg-clip-text text-transparent italic tracking-tighter leading-none">YOU'RE IN!</h2>
                                    <p className="text-white/40 font-black uppercase tracking-[0.5em] text-sm animate-pulse">WARMING UP THE ENGINES...</p>
                                </div>
                            </motion.div>
                        )}

                        {gameState.status === 'PLAYING' && (
                            <div className="flex-1 flex flex-col w-full h-full rounded-2xl overflow-hidden relative">
                                {(() => {
                                    const PlayerComponent = PLAYER_COMPONENTS[gameState.currentGame || ''];
                                    if (PlayerComponent) {
                                        return <PlayerComponent gameState={gameState} />;
                                    }
                                    return (
                                        <div className="flex flex-col items-center justify-center h-full text-center space-y-6">
                                            <div className="w-16 h-16 border-4 border-white/10 border-t-cyan-400 rounded-full animate-spin shadow-[0_0_20px_rgba(0,255,255,0.3)]" />
                                            <p className="text-white/30 font-black uppercase tracking-widest text-sm">Preparing Round...</p>
                                        </div>
                                    );
                                })()}
                            </div>
                        )}
                        
                        {(gameState.status === 'RESULTS' || gameState.status === 'GAME_SELECT') && (
                            <motion.div
                                key="waiting"
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="flex-1 flex flex-col items-center text-center space-y-6 p-4 max-h-screen overflow-hidden"
                            >
                                <div className="flex flex-col items-center space-y-2 mb-2">
                                    <h2 className="text-6xl font-black italic tracking-tighter uppercase leading-tight bg-gradient-to-r from-yellow-400 to-yellow-600 bg-clip-text text-transparent drop-shadow-lg">
                                        {Object.values(gameState.players).filter(p => !p.isHost).sort((a,b) => b.score - a.score)[0]?.id === socket?.id 
                                            ? "🏆 PLATINUM" 
                                            : "🏁 FINISHED"}
                                    </h2>
                                    <p className="text-white/20 font-black uppercase tracking-[0.5em] text-[10px]">Current Global Standings</p>
                                </div>

                                {/* FULL LANE LEADERBOARD */}
                                <div className="flex-1 w-full overflow-hidden relative glass-panel rounded-[3rem] border border-white/5 bg-white/[0.02]">
                                    <AutoScrollingLeaderboard players={Object.values(gameState.players).filter(p => !p.isHost)} myId={socket?.id || ''} />
                                </div>

                                <div className="w-full grid grid-cols-2 gap-4 py-4 border-t border-white/5 bg-black/40 px-4 -mx-4">
                                    <div className="flex flex-col items-center">
                                        <span className="text-[10px] font-black text-white/20 uppercase tracking-widest">RANK</span>
                                        <span className="text-5xl font-black text-cyan-400">
                                            #{Object.values(gameState.players)
                                                .filter(p => !p.isHost)
                                                .sort((a, b) => b.score - a.score)
                                                .findIndex(p => p.id === socket?.id) + 1}
                                        </span>
                                    </div>
                                    <div className="flex flex-col items-center">
                                        <span className="text-[10px] font-black text-white/20 uppercase tracking-widest">SCORE</span>
                                        <span className="text-5xl font-black text-pink-500">{me.score}</span>
                                    </div>
                                </div>

                                <div className="pb-8 flex flex-col items-center gap-3">
                                    <p className="text-xs font-black uppercase tracking-[0.3em] text-white/30 animate-pulse">WATCH THE HOST SCREEN FOR THE NEXT ROUND</p>
                                    <div className="flex gap-2">
                                        <div className="w-2 h-2 rounded-full bg-cyan-500 animate-bounce" />
                                        <div className="w-2 h-2 rounded-full bg-pink-500 animate-bounce delay-100" />
                                        <div className="w-2 h-2 rounded-full bg-yellow-500 animate-bounce delay-200" />
                                    </div>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </main>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#0d0f1a] text-white flex items-center justify-center p-6 font-['Outfit'] overflow-y-auto">
            <AnimatePresence mode="wait">
                {joinStep === 'CODE' ? (
                    <motion.form key="code"
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 1.1 }}
                        className="w-full max-w-sm flex flex-col items-center gap-10"
                        onSubmit={(e) => { e.preventDefault(); if (roomCode.length === 4) { playClick(); setJoinStep('DETAILS'); } }}
                    >
                        <div className="text-center space-y-2">
                            <h1 className="text-6xl font-black tracking-tighter italic bg-gradient-to-r from-cyan-400 to-pink-500 bg-clip-text text-transparent">JOIN FAM</h1>
                            <p className="text-white/30 font-bold uppercase tracking-[0.4em] text-[10px]">Transmission Code Required</p>
                        </div>

                        <div className="w-full">
                            <input
                                type="text"
                                maxLength={4}
                                value={roomCode}
                                onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
                                placeholder="----"
                                className="w-full h-24 bg-white/[0.02] text-center text-6xl font-black tracking-[0.3em] transition-all placeholder:text-white/5 uppercase rounded-2xl border-2 border-white/10 focus:border-cyan-500 focus:bg-cyan-500/5 outline-none font-mono"
                                autoFocus
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={roomCode.length < 4}
                            className="w-full py-5 rounded-2xl bg-gradient-to-r from-cyan-500 to-pink-500 font-black text-xl uppercase tracking-widest shadow-lg shadow-cyan-500/20 disabled:opacity-20 transform active:scale-95 transition-all"
                        >
                            CONNECT
                        </button>
                    </motion.form>
                ) : (
                    <motion.form key="details"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9 }}
                        onSubmit={handleJoin}
                        className="w-full max-w-sm flex flex-col items-center gap-8"
                    >
                        <div className="text-center space-y-2">
                            <h2 className="text-4xl font-black tracking-tight italic">YOUR PERSONA</h2>
                            <p className="text-white/30 font-bold uppercase tracking-[0.3em] text-[10px]">Identify Yourself</p>
                        </div>

                        <div className="flex flex-col items-center gap-6 w-full">
                            <motion.div
                                whileTap={{ scale: 0.9 }}
                                className="w-32 h-32 rounded-3xl flex items-center justify-center text-7xl shadow-2xl transition-all border-4"
                                style={{ 
                                    backgroundColor: `${color}15`, 
                                    borderColor: color,
                                    boxShadow: `0 0 30px ${color}40`
                                }}
                            >
                                {avatar}
                            </motion.div>
                            
                            <input
                                type="text"
                                value={name}
                                onChange={(e) => setName(e.target.value.slice(0, 12).toUpperCase())}
                                placeholder="WHO ARE YOU?"
                                className="w-full h-16 bg-white/[0.02] px-6 text-2xl font-black text-center transition-all placeholder:text-white/5 rounded-2xl border-2 border-white/10 focus:border-cyan-500 outline-none"
                                autoFocus
                            />
                        </div>

                        <div className="w-full space-y-6">
                            <div className="space-y-4">
                                <p className="text-[10px] font-black uppercase tracking-widest text-center text-white/30">Select Vibe</p>
                                <div className="flex flex-wrap gap-2 justify-center">
                                    {COLORS.map((c) => (
                                        <button
                                            key={c}
                                            type="button"
                                            onClick={() => { playClick(); setColor(c); }}
                                            className={`w-8 h-8 rounded-full transition-all ${color === c ? 'scale-125 ring-2 ring-white shadow-[0_0_15px_rgba(255,255,255,0.5)]' : 'opacity-30 hover:opacity-60'}`}
                                            style={{ backgroundColor: c }}
                                        />
                                    ))}
                                </div>
                            </div>

                            <div className="space-y-4">
                                <p className="text-[10px] font-black uppercase tracking-widest text-center text-white/30">Select Soul</p>
                                <div className="h-24 overflow-y-auto px-4 py-2 bg-white/5 rounded-2xl border border-white/10 custom-scrollbar">
                                    <div className="grid grid-cols-6 gap-3">
                                        {AVATARS.map((a) => (
                                            <button
                                                key={a}
                                                type="button"
                                                onClick={() => { playClick(); setAvatar(a); }}
                                                className={`text-2xl p-1 rounded-lg transition-all ${avatar === a ? 'bg-white/20 scale-110 border border-white/30' : 'opacity-40 hover:opacity-80'}`}
                                            >
                                                {a}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            <div className="flex gap-4 pt-4">
                                <button
                                    type="button"
                                    onClick={() => { playClick(); setJoinStep('CODE'); }}
                                    className="px-6 h-14 rounded-xl bg-white/5 font-bold text-[10px] uppercase tracking-widest text-white/40 border border-white/5"
                                >
                                    BACK
                                </button>
                                <button
                                    type="submit"
                                    disabled={!name.trim()}
                                    className="flex-1 h-14 rounded-xl bg-gradient-to-r from-cyan-500 to-pink-500 font-black text-lg uppercase tracking-widest shadow-lg shadow-cyan-500/20 active:scale-95 transition-all"
                                >
                                    JOIN PARTY
                                </button>
                            </div>
                        </div>
                    </motion.form>
                )}
            </AnimatePresence>
        </div>
    );
};

export default PlayerLogic;