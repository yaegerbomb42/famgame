import { useEffect, useMemo, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useGameStore } from '../store/useGameStore';
import { usePersona } from '../context/PersonaContext';

type ChatPanelProps = {
    variant?: 'host' | 'player';
};

export const ChatPanel = ({ variant = 'player' }: ChatPanelProps) => {
    const { gameState, sendChat } = useGameStore();
    const { speak } = usePersona();
    const [text, setText] = useState('');
    const [isOpen, setIsOpen] = useState(variant === 'host');
    const listRef = useRef<HTMLDivElement | null>(null);
    const lastSpokenId = useRef<string | null>(null);

    const messages = useMemo(() => gameState?.chat ?? [], [gameState?.chat]);
    const aiPersona = gameState?.aiPersona;

    useEffect(() => {
        if (!listRef.current) return;
        listRef.current.scrollTop = listRef.current.scrollHeight;
    }, [messages.length]);

    useEffect(() => {
        const latest = messages[messages.length - 1];
        if (!latest || !latest.isAi || latest.id === lastSpokenId.current) return;
        lastSpokenId.current = latest.id;
        speak(latest.text, true);
    }, [messages, speak]);

    const handleSubmit = (event: React.FormEvent) => {
        event.preventDefault();
        if (!text.trim()) return;
        sendChat(text.trim());
        setText('');
    };

    return (
        <div className={`${variant === 'host' ? 'fixed right-6 bottom-6' : 'fixed left-4 right-4 bottom-6'} z-[90]`}>
            <div className={`flex flex-col ${variant === 'host' ? 'w-[360px]' : 'w-full'}`}>
                <button
                    onClick={() => setIsOpen((prev) => !prev)}
                    className="flex items-center justify-between gap-3 bg-white/10 border border-white/10 px-4 py-3 rounded-full text-sm font-black uppercase tracking-widest text-white/70 hover:bg-white/20 transition"
                >
                    <span className="flex items-center gap-3">
                        <span className="text-lg">💬</span>
                        Chat Drop
                    </span>
                    <span className="text-xs text-white/40">{isOpen ? 'Hide' : 'Show'}</span>
                </button>

                <AnimatePresence>
                    {isOpen && (
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: 10 }}
                            className="mt-3 rounded-[1.5rem] border border-white/10 bg-game-bg/90 backdrop-blur-xl shadow-[0_20px_60px_rgba(0,0,0,0.4)] overflow-hidden"
                        >
                            <div className="flex items-center gap-3 px-4 py-3 border-b border-white/10 bg-white/5">
                                <div className="text-2xl">{aiPersona?.avatar ?? '🤖'}</div>
                                <div className="flex-1">
                                    <div className="text-xs uppercase tracking-[0.3em] text-white/40 font-black">AI Host</div>
                                    <div className="text-sm font-black text-white">{aiPersona?.name ?? 'BYTE'}</div>
                                </div>
                                <div className="h-2 w-2 bg-green-400 rounded-full animate-pulse" />
                            </div>

                            <div ref={listRef} className="max-h-[260px] overflow-y-auto px-4 py-3 space-y-3 custom-scrollbar">
                                {messages.length === 0 && (
                                    <div className="text-center text-white/30 text-sm font-semibold uppercase tracking-widest py-8">
                                        No messages yet
                                    </div>
                                )}
                                {messages.map((message) => (
                                    <motion.div
                                        key={message.id}
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        className={`flex gap-2 ${message.isAi ? 'items-start' : 'items-start'}`}
                                    >
                                        <div className="text-xl">{message.avatar ?? (message.isAi ? aiPersona?.avatar ?? '🤖' : '👾')}</div>
                                        <div className={`flex-1 rounded-2xl px-3 py-2 border ${
                                            message.isAi
                                                ? 'bg-game-primary/10 border-game-primary/30 text-white'
                                                : message.isSystem
                                                    ? 'bg-white/5 border-white/10 text-white/60'
                                                    : 'bg-white/10 border-white/10 text-white'
                                        }`}
                                        >
                                            <div className="text-[10px] uppercase tracking-[0.3em] text-white/40 font-black">
                                                {message.name}
                                            </div>
                                            <div className="text-sm font-semibold leading-snug">{message.text}</div>
                                        </div>
                                    </motion.div>
                                ))}
                            </div>

                            <form onSubmit={handleSubmit} className="flex gap-2 p-3 border-t border-white/10 bg-white/5">
                                <input
                                    value={text}
                                    onChange={(event) => setText(event.target.value)}
                                    placeholder="Type your hype..."
                                    className="flex-1 bg-white/10 border border-white/10 rounded-full px-4 py-2 text-sm font-semibold text-white focus:outline-none focus:border-game-secondary"
                                />
                                <button
                                    type="submit"
                                    className="px-4 py-2 rounded-full bg-game-secondary text-game-bg font-black text-xs uppercase tracking-widest hover:scale-105 transition"
                                >
                                    Send
                                </button>
                            </form>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
};
