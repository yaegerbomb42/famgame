import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';

interface BlockData {
    tempValue?: string;
    options?: string[];
    targetValue?: string | number | { x: number; y: number };
    label?: string;
    points?: { x: number; y: number; label?: string }[];
}

type BlockValue = string | number | { x: number; y: number } | string[] | number[] | undefined;
type ActionPayload = { text?: string; index?: number; value?: BlockValue; values?: BlockValue[] };
type AnswerData = { text?: string; index?: number; value?: BlockValue; values?: BlockValue[] };

interface UIBlock {
    type: string;
    data: BlockData;
}

interface UIBlockProps {
    blocks?: UIBlock[];
    type?: string;
    data?: BlockData;
    onAction?: (action: string, payload: ActionPayload) => void;
    players?: Record<string, { name: string; avatar?: string }>;
    answers?: Record<string, AnswerData>;
    showResult?: boolean;
}

// --- PLAYER SUB-COMPONENTS ---

const PlayerInputField = ({ onAction }: { onAction?: (action: string, payload: ActionPayload) => void }) => {
    const [val, setVal] = useState('');
    return (
        <div className="flex flex-col space-y-6 w-full max-w-md mx-auto">
            <textarea
                autoFocus
                className="w-full bg-white/5 border-2 border-white/20 rounded-[2rem] p-8 text-2xl font-bold text-white focus:border-cyan-400 focus:outline-none placeholder-white/10 resize-none h-48 shadow-[0_0_30px_rgba(0,0,0,0.4)] transition-all text-center"
                placeholder="Type your response..."
                value={val}
                onChange={(e) => setVal(e.target.value)}
            />
            <motion.button
                whileTap={{ scale: 0.95 }}
                onClick={() => onAction?.('SUBMIT', { text: val })}
                className="w-full py-5 rounded-2xl bg-gradient-to-r from-cyan-500 to-blue-600 font-black text-xl uppercase tracking-widest text-white shadow-[0_0_30px_rgba(6,182,212,0.4)]"
            >
                Confirm
            </motion.button>
        </div>
    );
};

const PlayerSlider = ({ onAction }: { onAction?: (action: string, payload: ActionPayload) => void }) => {
    const [val, setVal] = useState(50);
    return (
        <div className="flex flex-col space-y-8 w-full max-w-md mx-auto py-8">
            <div className="text-center">
                <span className="text-6xl font-black text-cyan-400 drop-shadow-[0_0_15px_rgba(34,211,238,0.5)]">{val}</span>
            </div>
            <input
                type="range"
                min="0"
                max="100"
                value={val}
                onChange={(e) => setVal(parseInt(e.target.value))}
                className="w-full h-4 bg-white/10 rounded-lg appearance-none cursor-pointer accent-cyan-400"
                title="Input Slider"
            />
            <motion.button
                whileTap={{ scale: 0.95 }}
                onClick={() => onAction?.('SUBMIT', { text: String(val) })}
                className="w-full py-6 rounded-3xl bg-cyan-500 font-black text-2xl uppercase tracking-[0.2em] text-white shadow-[0_0_30px_rgba(6,182,212,0.3)]"
            >
                Submit Guess
            </motion.button>
        </div>
    );
};

const PlayerButtonGrid = ({ options, onAction }: { options?: string[], onAction?: (action: string, payload: ActionPayload) => void }) => (
    <div className="grid grid-cols-2 gap-4 w-full">
        {(options || []).map((opt, i) => (
            <motion.button
                key={i}
                whileTap={{ scale: 0.9 }}
                onClick={() => onAction?.('SUBMIT', { text: opt, index: i })}
                className="p-8 rounded-[2.5rem] bg-white/5 border-2 border-white/10 text-white font-black text-2xl hover:border-cyan-400 hover:bg-cyan-400/10 transition-all text-center"
            >
                {opt}
            </motion.button>
        ))}
    </div>
);

const PlayerReactionGrid = ({ onAction }: { onAction?: (action: string, payload: ActionPayload) => void }) => {
    const emojis = ['🔥', '😂', '😱', '🤔', '💀', '🤡', '💅', '👀'];
    return (
        <div className="grid grid-cols-4 gap-4 w-full max-w-sm mx-auto">
            {emojis.map((emoji) => (
                <motion.button
                    key={emoji}
                    whileTap={{ scale: 1.2, rotate: [0, -10, 10, 0] }}
                    onClick={() => onAction?.('SUBMIT', { text: emoji })}
                    className="text-4xl p-4 bg-white/5 rounded-2xl hover:bg-white/10 transition-colors"
                >
                    {emoji}
                </motion.button>
            ))}
        </div>
    );
};

const PlayerCheckboxGroup = ({ options, onAction }: { options?: string[], onAction?: (action: string, payload: ActionPayload) => void }) => {
    const [selected, setSelected] = useState<number[]>([]);

    const toggle = (idx: number) => {
        const next = selected.includes(idx) ? selected.filter(i => i !== idx) : [...selected, idx];
        setSelected(next);
    };

    return (
        <div className="flex flex-col space-y-4 w-full max-w-md mx-auto">
            <div className="space-y-2">
                {(options || []).map((opt, i) => (
                    <button
                        key={i}
                        onClick={() => toggle(i)}
                        className={`w-full p-4 rounded-xl border-2 flex items-center justify-between transition-all ${selected.includes(i) ? 'border-cyan-400 bg-cyan-400/10 text-white' : 'border-white/10 bg-white/5 text-white/50'}`}
                    >
                        <span className="font-bold">{opt}</span>
                        <div className={`w-6 h-6 rounded-md border-2 ${selected.includes(i) ? 'bg-cyan-400 border-cyan-400' : 'border-white/20'}`}>
                            {selected.includes(i) && <span className="text-black text-xs">✓</span>}
                        </div>
                    </button>
                ))}
            </div>
            <motion.button
                whileTap={{ scale: 0.95 }}
                onClick={() => onAction?.('SUBMIT', { values: selected.map(i => options?.[i]) })}
                className="w-full py-6 rounded-2xl bg-gradient-to-r from-cyan-600 to-blue-600 font-black text-2xl uppercase tracking-widest text-white shadow-[0_10px_40px_rgba(6,182,212,0.3)]"
            >
                Lock Choice
            </motion.button>
        </div>
    );
};

// --- HOST SUB-COMPONENTS ---

const HostRevealValue = ({ targetValue, showResult }: { targetValue?: string | number | { x: number; y: number }, showResult?: boolean }) => (
    <div className="flex flex-col items-center justify-center space-y-8">
        <AnimatePresence mode="wait">
            {!showResult ? (
                <motion.div
                    key="waiting"
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 1.2 }}
                    className="text-8xl font-black text-white/10 animate-pulse tracking-tighter"
                >
                    ???
                </motion.div>
            ) : (
                <motion.div
                    key="reveal"
                    initial={{ opacity: 0, y: 50, filter: 'blur(20px)' }}
                    animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                    className="flex flex-col items-center"
                >
                    <span className="text-sm font-black text-cyan-400 uppercase tracking-[0.5em] mb-4">The Result</span>
                    <div className="text-9xl font-black text-white drop-shadow(0_0_50px_rgba(255,255,255,0.3))">
                        {typeof targetValue === 'object' ? JSON.stringify(targetValue) : targetValue}
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    </div>
);

const HostBarChart = ({ answers, showResult }: { answers?: Record<string, { text?: string }>, showResult?: boolean }) => {
    const counts: Record<string, number> = {};
    Object.values(answers || {}).forEach(ans => {
        const val = ans.text || 'Unknown';
        counts[val] = (counts[val] || 0) + 1;
    });

    const sorted = Object.entries(counts).sort((a, b) => b[1] - a[1]);
    const max = Math.max(...Object.values(counts), 1);

    return (
        <div className="w-full max-w-4xl mx-auto space-y-6">
            {sorted.map(([label, count]) => (
                <div key={label} className="relative h-16 bg-white/5 rounded-2xl overflow-hidden border border-white/10">
                    <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: showResult ? `${(count / max) * 100}% ` : '0%' }}
                        className="absolute inset-0 bg-gradient-to-r from-cyan-600 to-blue-500"
                    />
                    <div className="absolute inset-0 flex items-center justify-between px-6 z-10">
                        <span className="text-xl font-bold text-white uppercase">{label}</span>
                        <span className="text-2xl font-black text-white">{showResult ? count : ''}</span>
                    </div>
                </div>
            ))}
        </div>
    );
};

const HostWordCloud = ({ answers, showResult }: { answers?: Record<string, { text?: string }>, showResult?: boolean }) => (
    <div className="flex flex-wrap justify-center gap-4 p-8">
        {Object.values(answers || {}).map((ans, i) => (
            <motion.div
                key={i}
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: showResult ? 1 : 0.5, opacity: showResult ? 1 : 0.2 }}
                className="px-6 py-3 bg-white/5 border border-white/10 rounded-full text-white font-bold text-2xl lowercase tracking-tight"
            >
                {ans.text}
            </motion.div>
        ))}
    </div>
);

const HostScatterPlot = ({ points, answers, showResult }: { points?: { x: number; y: number; label?: string }[], answers?: Record<string, any>, showResult?: boolean }) => (
    <div className="relative w-full aspect-video bg-white/5 rounded-[3rem] border-2 border-white/10 overflow-hidden">
        {/* Grid Lines */}
        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)', backgroundSize: '40px 40px' }} />

        {/* Points */}
        {points?.map((p, i) => (
            <motion.div
                key={i}
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                style={{ left: `${p.x}%`, top: `${p.y}%` }}
                className="absolute w-4 h-4 bg-cyan-400 rounded-full shadow-[0_0_15px_#22d3ee] -translate-x-1/2 -translate-y-1/2"
            >
                {p.label && <span className="absolute top-8 left-1/2 -translate-x-1/2 text-sm font-black text-[#00ffff] uppercase tracking-[0.3em] whitespace-nowrap bg-black/60 px-3 py-1 rounded-md border border-cyan-400/30">{p.label}</span>}
            </motion.div>
        ))}

        {/* Player Answers as crosses */}
        {showResult && Object.entries(answers || {}).map(([pid, ans]) => {
            if (!ans.value?.x) return null;
            return (
                <motion.div
                    key={pid}
                    initial={{ scale: 0, rotate: 45 }}
                    animate={{ scale: 1 }}
                    style={{ left: `${ans.value.x}%`, top: `${ans.value.y}%` }}
                    className="absolute w-6 h-6 text-2xl -translate-x-1/2 -translate-y-1/2"
                >
                    ❌
                </motion.div>
            );
        })}
    </div>
);

const HostStatWidget = ({ label, value, showResult }: { label?: string, value?: any, showResult?: boolean }) => (
    <div className="p-12 rounded-[3.5rem] bg-gradient-to-br from-white/10 to-transparent border-t-2 border-white/10 shadow-2xl space-y-6 text-center">
        <span className="text-xl font-black text-[#00ffff] uppercase tracking-[0.6em]">{label || 'Sensor Reading'}</span>
        <div className="text-9xl font-black text-white tabular-nums drop-shadow-[0_0_30px_rgba(255,255,255,0.2)]">
            {!showResult ? '---' : value}
        </div>
    </div>
);

/**
 * A highly aesthetic dynamic renderer for AI-invented game mechanics.
 */
export const DynamicGameUI = (props: UIBlockProps) => {
    const { blocks, type, data, onAction, answers, showResult } = props;

    // Support for multiple blocks
    if (blocks && blocks.length > 0) {
        return (
            <div className="flex flex-col space-y-12 w-full">
                {blocks.map((b: UIBlock, i: number) => (
                    <div key={i} className="w-full">
                        <DynamicGameUI
                            type={b.type}
                            data={b.data}
                            onAction={onAction}
                            answers={answers}
                            showResult={showResult}
                            players={props.players}
                        />
                    </div>
                ))}
            </div>
        );
    }

    // Individual block renderer
    switch (type) {
        // Player
        case 'INPUT_FIELD': return <PlayerInputField onAction={onAction} />;
        case 'SLIDER': return <PlayerSlider onAction={onAction} />;
        case 'BUTTON_GRID': return <PlayerButtonGrid options={data?.options} onAction={onAction} />;
        case 'REACTION_GRID': return <PlayerReactionGrid onAction={onAction} />;
        case 'CHECKBOX_GROUP': return <PlayerCheckboxGroup options={data?.options} onAction={onAction} />;

        // Host
        case 'REVEAL_VALUE': return <HostRevealValue targetValue={data?.targetValue} showResult={showResult} />;
        case 'BAR_CHART': return <HostBarChart answers={answers} showResult={showResult} />;
        case 'WORD_CLOUD': return <HostWordCloud answers={answers} showResult={showResult} />;
        case 'SCATTER_PLOT': return <HostScatterPlot points={data?.points} answers={answers} showResult={showResult} />;
        case 'STAT_WIDGET': return <HostStatWidget label={data?.label} value={data?.targetValue} showResult={showResult} />;

        default: return <div className="text-white/20">Unknown Block Type: {type}</div>;
    }
};
