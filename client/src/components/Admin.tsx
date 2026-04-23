import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useGameStore } from '../store/useGameStore';
import { useSound } from '../context/SoundContext';

interface AnalyticsData {
    totalVisits: number;
    allTimePlayers: number;
    accountCreations: number;
    locations: Record<string, number>;
    referrals: Record<string, number>;
    activePlayers: number;
    activeRooms: number;
}

export const Admin: React.FC<{ onBack: () => void }> = ({ onBack }) => {
    const { socket, initSocket } = useGameStore();
    const { playSuccess, playError } = useSound();
    
    const [password, setPassword] = useState('');
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [stats, setStats] = useState<AnalyticsData | null>(null);
    const [error, setError] = useState('');

    useEffect(() => {
        initSocket();
    }, [initSocket]);

    useEffect(() => {
        if (!socket) return;

        socket.on('admin_login_success', () => {
            playSuccess();
            setIsLoggedIn(true);
            socket.emit('request_analytics', { password });
        });

        socket.on('admin_login_error', (err: { message: string }) => {
            playError();
            setError(err.message);
        });

        socket.on('analytics_data', (data: AnalyticsData) => {
            setStats(data);
        });

        return () => {
            socket.off('admin_login_success');
            socket.off('admin_login_error');
            socket.off('analytics_data');
        };
    }, [socket, password, playSuccess, playError]);

    useEffect(() => {
        if (isLoggedIn && socket) {
            const interval = setInterval(() => {
                socket.emit('request_analytics', { password });
            }, 5000);
            return () => clearInterval(interval);
        }
    }, [isLoggedIn, socket, password]);

    const handleLogin = (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        socket?.emit('admin_login', { password });
    };

    if (!isLoggedIn) {
        return (
            <div className="min-h-screen bg-[#0d0f1a] flex items-center justify-center p-6 font-['Outfit']">
                <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="w-full max-w-md bg-white/5 border border-white/10 p-12 rounded-[3rem] text-center space-y-8"
                >
                    <div className="text-6xl">🔐</div>
                    <h1 className="text-4xl font-black uppercase tracking-tighter italic">ADMIN <span className="text-pink-500">ACCESS</span></h1>
                    <form onSubmit={handleLogin} className="space-y-6">
                        <input 
                            type="password"
                            placeholder="PASSWORD"
                            value={password}
                            onChange={e => setPassword(e.target.value)}
                            className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-white font-bold text-center placeholder:text-white/20 focus:outline-none focus:border-pink-500 transition-all uppercase"
                        />
                        {error && <p className="text-pink-500 text-xs font-black uppercase tracking-widest">{error}</p>}
                        <button 
                            type="submit"
                            className="w-full bg-pink-500 text-white py-4 rounded-2xl font-black text-lg uppercase tracking-widest shadow-lg shadow-pink-500/20"
                        >
                            UNLOCK
                        </button>
                    </form>
                    <button onClick={onBack} className="text-white/30 text-xs font-black uppercase tracking-widest hover:text-white">Back to Home</button>
                </motion.div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#0d0f1a] p-8 md:p-12 text-white font-['Outfit']">
            <header className="flex justify-between items-center mb-12">
                <div>
                    <h1 className="text-5xl font-black tracking-tighter">CENTRAL <span className="text-cyan-400">COMMAND</span></h1>
                    <p className="text-xs font-black uppercase tracking-[0.3em] text-white/30">Live Intelligence & Metrics</p>
                </div>
                <button onClick={onBack} className="px-6 py-3 bg-white/5 border border-white/10 rounded-full font-black text-xs uppercase tracking-widest">Logout</button>
            </header>

            {stats ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                    {/* KEY METRICS */}
                    <StatCard title="Active Players" value={stats.activePlayers} subValue={`${stats.activeRooms} Live Rooms`} color="bg-cyan-500" />
                    <StatCard title="Total Players" value={stats.allTimePlayers} subValue="Across all sessions" color="bg-pink-500" />
                    <StatCard title="Total Accounts" value={stats.accountCreations} subValue="Saved API keys" color="bg-yellow-500" />
                    <StatCard title="Recent Visits" value={stats.totalVisits} subValue="Since last reset" color="bg-emerald-500" />

                    {/* REFERRALS */}
                    <div className="lg:col-span-2 bg-white/5 border border-white/10 p-8 rounded-[3rem] space-y-6">
                        <h3 className="text-xl font-black uppercase tracking-widest text-white/40">Traffic Sources</h3>
                        <div className="space-y-4">
                            {Object.entries(stats.referrals).sort((a,b) => b[1] - a[1]).map(([source, count]) => (
                                <div key={source} className="flex justify-between items-center">
                                    <span className="font-bold text-white/80">{source}</span>
                                    <span className="font-mono text-cyan-400">{count}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* LOCATIONS */}
                    <div className="lg:col-span-2 bg-white/5 border border-white/10 p-8 rounded-[3rem] space-y-6">
                        <h3 className="text-xl font-black uppercase tracking-widest text-white/40">Visitor Locations</h3>
                        <div className="space-y-4">
                            {Object.entries(stats.locations).sort((a,b) => b[1] - a[1]).map(([loc, count]) => (
                                <div key={loc} className="flex justify-between items-center">
                                    <span className="font-bold text-white/80">{loc}</span>
                                    <span className="font-mono text-emerald-400">{count}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            ) : (
                <div className="py-24 text-center">
                    <div className="text-3xl font-black uppercase tracking-widest animate-pulse text-white/20">Establishing Uplink...</div>
                </div>
            )}
        </div>
    );
};

const StatCard: React.FC<{ title: string, value: number, subValue: string, color: string }> = ({ title, value, subValue, color }) => (
    <motion.div 
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="bg-white/5 border border-white/10 p-8 rounded-[3rem] space-y-4"
    >
        <div className="flex justify-between items-start">
            <span className="text-[10px] font-black uppercase tracking-widest text-white/40">{title}</span>
            <div className={`w-3 h-3 rounded-full ${color} shadow-[0_0_15px_rgba(255,255,255,0.2)]`} />
        </div>
        <div className="text-6xl font-black tracking-tight">{value}</div>
        <div className="text-[10px] font-bold uppercase tracking-widest text-white/20">{subValue}</div>
    </motion.div>
);
