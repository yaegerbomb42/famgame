import { useEffect, useRef, useState } from 'react';
import Peer from 'simple-peer';
import { useGameStore } from '../store/useGameStore';
import { Mic, MicOff, Volume2, VolumeX } from 'lucide-react';

export const VoiceChat = () => {
    const { socket, gameState, isConnected } = useGameStore();
    const [stream, setStream] = useState<MediaStream | null>(null);
    const [muted, setMuted] = useState(false);
    const [deafened, setDeafened] = useState(false);
    
    const peersRef = useRef<Record<string, Peer.Instance>>({});
    const streamsRef = useRef<Record<string, HTMLAudioElement>>({});

    useEffect(() => {
        if (!isConnected || !socket) return;

        const initVoice = async () => {
            try {
                const userStream = await navigator.mediaDevices.getUserMedia({ audio: true });
                setStream(userStream);
                
                socket.emit('joinVoice');

                socket.on('userJoinedVoice', (userId: string) => {
                    const peer = createPeer(userId, userStream);
                    peersRef.current[userId] = peer;
                });

                socket.on('signal', ({ from, signal }: { from: string, signal: any }) => {
                    if (peersRef.current[from]) {
                        peersRef.current[from].signal(signal);
                    } else {
                        const peer = addPeer(from, signal, userStream);
                        peersRef.current[from] = peer;
                    }
                });
            } catch (err) {
                console.error('Failed to get media stream', err);
            }
        };

        initVoice();

        return () => {
            stream?.getTracks().forEach(track => track.stop());
            Object.values(peersRef.current).forEach(peer => peer.destroy());
            socket.off('userJoinedVoice');
            socket.off('signal');
        };
    }, [isConnected, socket]);

    function createPeer(userIdToSignal: string, stream: MediaStream) {
        const peer = new Peer({
            initiator: true,
            trickle: false,
            stream,
        });

        peer.on('signal', signal => {
            socket?.emit('signal', { to: userIdToSignal, signal });
        });

        peer.on('stream', userStream => {
            const audio = new Audio();
            audio.srcObject = userStream;
            audio.play();
            streamsRef.current[userIdToSignal] = audio;
        });

        return peer;
    }

    function addPeer(incomingSignal: any, callerId: string, stream: MediaStream) {
        const peer = new Peer({
            initiator: false,
            trickle: false,
            stream,
        });

        peer.on('signal', signal => {
            socket?.emit('signal', { to: callerId, signal });
        });

        peer.on('stream', userStream => {
            const audio = new Audio();
            audio.srcObject = userStream;
            audio.play();
            streamsRef.current[callerId] = audio;
        });

        peer.signal(incomingSignal);

        return peer;
    }

    useEffect(() => {
        if (stream) {
            stream.getAudioTracks()[0].enabled = !muted;
        }
    }, [muted, stream]);

    useEffect(() => {
        Object.values(streamsRef.current).forEach(audio => {
            audio.muted = deafened;
        });
    }, [deafened]);

    if (!gameState) return null;

    return (
        <div className="fixed bottom-4 right-4 flex gap-2 z-[100]">
            <button
                onClick={() => setMuted(!muted)}
                className={`p-4 rounded-full shadow-2xl transition-all ${muted ? 'bg-red-500 text-white' : 'bg-white/10 text-white hover:bg-white/20'}`}
            >
                {muted ? <MicOff size={24} /> : <Mic size={24} />}
            </button>
            <button
                onClick={() => setDeafened(!deafened)}
                className={`p-4 rounded-full shadow-2xl transition-all ${deafened ? 'bg-red-500 text-white' : 'bg-white/10 text-white hover:bg-white/20'}`}
            >
                {deafened ? <VolumeX size={24} /> : <Volume2 size={24} />}
            </button>
        </div>
    );
};
