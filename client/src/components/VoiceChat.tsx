import { useEffect, useRef, useState } from 'react';
import Peer from 'simple-peer';
import { useGameStore } from '../store/useGameStore';
import { useVoiceStore } from '../store/useVoiceStore';
import { Mic, MicOff, Volume2, VolumeX } from 'lucide-react';

export const VoiceChat = () => {
    const { socket, gameState, isConnected } = useGameStore();
    const { setSpeaking } = useVoiceStore();
    const [stream, setStream] = useState<MediaStream | null>(null);
    const [muted, setMuted] = useState(false);
    const [deafened, setDeafened] = useState(false);

    const peersRef = useRef<Record<string, Peer.Instance>>({});
    const streamsRef = useRef<Record<string, HTMLAudioElement>>({});
    const audioContextRef = useRef<AudioContext | null>(null);

    // Audio Analysis Helper (Hoisted logic)
    const setupAudioAnalysis = (stream: MediaStream, userId: string) => {
        try {
            if (!audioContextRef.current) {
                audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
            }
            const audioContext = audioContextRef.current;
            const source = audioContext.createMediaStreamSource(stream);
            const analyser = audioContext.createAnalyser();
            analyser.fftSize = 256;
            source.connect(analyser);

            const dataArray = new Uint8Array(analyser.frequencyBinCount);

            const checkVolume = () => {
                if (!stream.active) {
                    setSpeaking(userId, false);
                    return;
                }
                analyser.getByteFrequencyData(dataArray);
                const average = dataArray.reduce((a, b) => a + b) / dataArray.length;
                setSpeaking(userId, average > 15);
                requestAnimationFrame(checkVolume);
            };
            checkVolume();
        } catch (e) {
            console.error("Audio analysis failed", e);
        }
    };

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
            setupAudioAnalysis(userStream, userIdToSignal);
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
            setupAudioAnalysis(userStream, callerId);
        });

        peer.signal(incomingSignal);

        return peer;
    }

    useEffect(() => {
        if (!isConnected || !socket) return;

        const initVoice = async () => {
            try {
                const userStream = await navigator.mediaDevices.getUserMedia({ audio: true });
                setStream(userStream);

                if (socket?.id && gameState?.players[socket.id]) {
                    setupAudioAnalysis(userStream, socket.id);
                }

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

        const timer = setTimeout(initVoice, 1000);

        return () => {
            clearTimeout(timer);
            stream?.getTracks().forEach(track => track.stop());
            // Safe cleanup for refs
            const currentPeers = peersRef.current;
            Object.values(currentPeers).forEach(peer => peer.destroy());

            socket.off('userJoinedVoice');
            socket.off('signal');
            if (audioContextRef.current) {
                audioContextRef.current.close();
                audioContextRef.current = null;
            }
        };
    }, [isConnected, socket]);

    useEffect(() => {
        if (stream && stream.getAudioTracks().length > 0) {
            stream.getAudioTracks()[0].enabled = !muted;
        }
    }, [muted, stream]);

    useEffect(() => {
        // Safe access to ref
        const currentStreams = streamsRef.current;
        Object.values(currentStreams).forEach(audio => {
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
