import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGameStore } from '../store/useGameStore';
import { useSound } from '../context/SoundContext';

interface HostModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export const HostModal: React.FC<HostModalProps> = ({ isOpen, onClose }) => {
    const { socket } = useGameStore();
    const { playSuccess, playError, playClick } = useSound();
    
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [geminiKey, setGeminiKey] = useState('');
    const [isLogin, setIsLogin] = useState(true);
    const [message, setMessage] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!username || !password) {
            playError();
            setMessage('Fill in all fields');
            return;
        }

        socket?.emit('host_login', { 
            username, 
            password, 
            geminiKey: isLogin ? undefined : geminiKey 
        });

        socket?.once('host_login_success', (host: { username: string, geminiKey?: string }) => {
            playSuccess();
            localStorage.setItem('fam_host_user', username);
            localStorage.setItem('fam_host_pass', password);
            if (host.geminiKey) localStorage.setItem('fam_gemini_key', host.geminiKey);
            setMessage('Success! Key saved.');
            setTimeout(onClose, 1500);
        });

        socket?.once('host_login_error', (err: { message: string }) => {
            playError();
            setMessage(err.message);
        });
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
                    <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="absolute inset-0 bg-[#0d0f1a]/90 backdrop-blur-xl"
                    />
                    
                    <motion.div
                        initial={{ scale: 0.9, y: 20, opacity: 0 }}
                        animate={{ scale: 1, y: 0, opacity: 1 }}
                        exit={{ scale: 0.9, y: 20, opacity: 0 }}
                        className="relative w-full max-w-xl bg-gradient-to-br from-[#1a1f3a] to-[#0d0f1a] border-2 border-white/10 rounded-[3rem] p-12 shadow-[0_0_100px_rgba(0,0,0,0.5)] overflow-hidden"
                    >
                        {/* DECORATIVE ACCENTS */}
                        <div className="absolute -top-24 -right-24 w-48 h-48 bg-cyan-500/20 blur-[80px] rounded-full" />
                        <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-pink-500/10 blur-[80px] rounded-full" />

                        <div className="relative z-10 space-y-8">
                            <div className="text-center space-y-2">
                                <h2 className="text-4xl font-black uppercase tracking-tighter italic">
                                    HOST <span className="text-cyan-400">SIGN IN</span>
                                </h2>
                                <p className="text-white/40 text-xs font-bold uppercase tracking-[0.3em]">Save your API keys for life</p>
                            </div>

                            <form onSubmit={handleSubmit} className="space-y-6">
                                <input 
                                    type="text"
                                    placeholder="USERNAME"
                                    value={username}
                                    onChange={e => setUsername(e.target.value)}
                                    className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-white font-bold placeholder:text-white/20 focus:outline-none focus:border-cyan-500/50 transition-all uppercase italic"
                                />
                                <input 
                                    type="password"
                                    placeholder="PASSWORD"
                                    value={password}
                                    onChange={e => setPassword(e.target.value)}
                                    className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-white font-bold placeholder:text-white/20 focus:outline-none focus:border-cyan-500/50 transition-all uppercase italic"
                                />
                                
                                {!isLogin && (
                                    <motion.input 
                                        initial={{ opacity: 0, height: 0 }}
                                        animate={{ opacity: 1, height: 'auto' }}
                                        type="text"
                                        placeholder="GEMINI API KEY"
                                        value={geminiKey}
                                        onChange={e => setGeminiKey(e.target.value)}
                                        className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-white font-bold placeholder:text-white/20 focus:outline-none focus:border-pink-500/50 transition-all"
                                    />
                                )}

                                {message && (
                                    <p className="text-center text-xs font-black uppercase tracking-widest text-[#00ff00] animate-pulse">
                                        {message}
                                    </p>
                                )}

                                <button 
                                    type="submit"
                                    className="w-full bg-gradient-to-r from-cyan-400 to-cyan-600 text-[#0d0f1a] py-5 rounded-2xl font-black text-lg uppercase tracking-widest shadow-lg shadow-cyan-500/20 active:scale-95 transition-all"
                                >
                                    {isLogin ? 'LOGIN' : 'SAVE KEY'}
                                </button>
                            </form>

                            <div className="text-center">
                                <button 
                                    onClick={() => { playClick(); setIsLogin(!isLogin); setMessage(''); }}
                                    className="text-white/30 hover:text-white text-[10px] font-black uppercase tracking-[0.2em] transition-colors"
                                >
                                    {isLogin ? "DON'T HAVE AN ACCOUNT? REGISTER" : "BACK TO LOGIN"}
                                </button>
                            </div>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
};
