import { useGameStore } from '../store/useGameStore';
import { useSound } from '../context/SoundContext';

/**
 * Always-available host escapes (stuck round, skip ahead, bail to lobby).
 * Kept small and high z-index so it clears chat / voice widgets.
 */
export const HostRecoveryBar = () => {
    const gameState = useGameStore((s) => s.gameState);
    const socket = useGameStore((s) => s.socket);
    const startGame = useGameStore((s) => s.startGame);
    const hostForceEndRound = useGameStore((s) => s.hostForceEndRound);
    const returnToPartyLobby = useGameStore((s) => s.returnToPartyLobby);
    const { playClick } = useSound();

    if (!gameState || gameState.status === 'LOBBY') return null;

    const isHost = socket?.id && gameState.hostId === socket.id;
    if (!isHost) return null;

    const status = gameState.status;

    const onAdvance = () => {
        playClick();
        if (status === 'PLAYING') hostForceEndRound();
        else if (status === 'RESULTS') startGame();
    };

    const onLobby = () => {
        playClick();
        returnToPartyLobby();
    };

    const showAdvance = status === 'PLAYING' || status === 'RESULTS';
    const advanceLabel = status === 'PLAYING' ? 'End round' : 'Next game';

    return (
        <div
            className="fixed bottom-32 right-5 z-[115] flex flex-col gap-1.5 items-end pointer-events-auto"
            aria-label="Host recovery controls"
        >
            {showAdvance && (
                <button
                    type="button"
                    onClick={onAdvance}
                    className="px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-[0.15em] bg-emerald-950/90 text-emerald-200/90 border border-emerald-500/40 shadow-lg backdrop-blur-md hover:bg-emerald-900/95 hover:text-emerald-100 transition-colors"
                >
                    {advanceLabel}
                </button>
            )}
            <button
                type="button"
                onClick={onLobby}
                className="px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-[0.15em] bg-black/75 text-white/70 border border-white/15 shadow-lg backdrop-blur-md hover:bg-black/90 hover:text-white transition-colors"
            >
                Party lobby
            </button>
        </div>
    );
};
