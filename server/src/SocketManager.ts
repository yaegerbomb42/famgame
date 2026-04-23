import { Server, Socket } from 'socket.io';
import { RoomManager } from './managers/RoomManager';
import { HostManager } from './managers/HostManager';
import { AnalyticsManager } from './managers/AnalyticsManager';

export class SocketManager {
    private io: Server;
    private rooms: Map<string, RoomManager>;
    private socketToRoom: Map<string, string>;

    constructor(io: Server) {
        this.io = io;
        this.rooms = new Map();
        this.socketToRoom = new Map();

        // Cleanup interval for inactive rooms (every 5 minutes)
        setInterval(() => this.cleanupRooms(), 5 * 60 * 1000);
    }

    public initialize() {
        this.io.on('connection', (socket: Socket) => {
            console.log('Client connected:', socket.id);
            
            // Log visit
            const referrer = socket.handshake.headers.referer || 'Direct';
            const ip = socket.handshake.address; // Simple IP capture
            AnalyticsManager.logVisit(referrer, 'Localhost'); // Hardcoded Localhost for now, can use geolite later

            this.handleSocketEvents(socket);
        });
    }

    private generateRoomCode(): string {
        const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ';
        let code = '';
        const existingCodes = Array.from(this.rooms.keys());
        
        do {
            code = '';
            for (let i = 0; i < 4; i++) {
                code += chars[Math.floor(Math.random() * chars.length)];
            }
        } while (existingCodes.includes(code));
        
        return code;
    }

    private handleSocketEvents(socket: Socket) {
        // Room Events
        socket.on('createRoom', ({ name, isPublic }: { name: string, isPublic?: boolean }) => {
            const code = this.generateRoomCode();
            const room = new RoomManager(this.io, code, !!isPublic);
            room.setHost(socket, name);
            
            this.rooms.set(code, room);
            this.socketToRoom.set(socket.id, code);
            
            console.log(`Room created: ${code} by ${socket.id} (Public: ${!!isPublic})`);
            socket.emit('gameState', room.state);
        });

        socket.on('joinRoom', ({ name, code, avatar, color }: { name: string, code: string, avatar?: string, color?: string }) => {
            const roomCode = (code || '').toUpperCase();
            const room = this.rooms.get(roomCode);
            
            if (!room) {
                socket.emit('error', { message: 'Room not found' });
                return;
            }

            const nonHostCount = Object.values(room.state.players).filter((p) => !p.isHost).length;
            if (nonHostCount >= 20) {
                socket.emit('error', { message: 'Room is full (20 players max)' });
                return;
            }

            room.handleJoinRoom(socket, name || 'Guest', avatar || '🙂', color);
            this.socketToRoom.set(socket.id, roomCode);
            
            console.log(`Player ${socket.id} joined room ${roomCode}`);
            socket.emit('gameState', room.state);
        });

        socket.on('disconnect', () => {
            const code = this.socketToRoom.get(socket.id);
            if (code) {
                const room = this.rooms.get(code);
                if (room) {
                    room.handleDisconnect(socket.id);
                    // Check if room is now empty
                    if (Object.keys(room.state.players).length === 0) {
                        this.destroyRoom(code);
                    }
                }
                this.socketToRoom.delete(socket.id);
            }
            console.log('Client disconnected:', socket.id);
        });

        // Game Flow & Inputs - Route to correct room
        const routeToRoom = (eventName: string, handler: (room: RoomManager, ...args: any[]) => void) => {
            socket.on(eventName, (...args: any[]) => {
                const code = this.socketToRoom.get(socket.id);
                if (code) {
                    const room = this.rooms.get(code);
                    if (room) {
                        handler(room, ...args);
                    }
                }
            });
        };

        routeToRoom('startGame', (room) => room.startGameSelect());
        routeToRoom('openGameSelect', (room) => room.handleOpenGameSelect(socket.id));
        routeToRoom('voteGame', (room, gameId) => room.handleVote(socket.id, gameId));
        routeToRoom('selectGame', (room, gameId) => room.selectGame(gameId));
        routeToRoom('gameInput', (room, data) => room.handleInput(socket.id, data));
        routeToRoom('backToLobby', (room) => room.hostBackToGameMenu(socket.id));

        routeToRoom('hostForceEndRound', (room) => room.hostForceEndRound(socket.id));

        routeToRoom('returnToPartyLobby', (room) => room.hostReturnToPartyLobby(socket.id));

        // Game-specific inputs mapped to room.handleInput
        routeToRoom('submitAnswer', (room, idx) => room.handleInput(socket.id, { answerIndex: idx }));
        routeToRoom('submitTriviaAnswer', (room, data) => room.handleInput(socket.id, data));
        routeToRoom('submitMashupIdea', (room, idea) => room.handleInput(socket.id, idea));
        routeToRoom('submitMashupAnswer', (room, data) => room.handleInput(socket.id, data));
        routeToRoom('submitAverageGuess', (room, guess) => room.handleInput(socket.id, guess));
        routeToRoom('submitSkillResult', (room, data) => room.handleInput(socket.id, data));
        routeToRoom('submitTruths', (room, data) => room.handleInput(socket.id, data));
        routeToRoom('submitBluff', (room, data) => room.handleInput(socket.id, data));
        routeToRoom('submitVote', (room, data) => room.handleInput(socket.id, data));
        routeToRoom('submitChain', (room, data) => room.handleInput(socket.id, data));
        routeToRoom('submitMeld', (room, data) => room.handleInput(socket.id, data));
        routeToRoom('submitStory', (room, data) => room.handleInput(socket.id, data));
        routeToRoom('submitDrawing', (room, data) => room.handleInput(socket.id, data));
        routeToRoom('submitWord', (room, data) => room.handleInput(socket.id, data));
        routeToRoom('submitReaction', (room, data) => room.handleInput(socket.id, data));
        routeToRoom('submitRoast', (room, data) => room.handleInput(socket.id, data));

        routeToRoom('setContinuousMode', (room, isContinuous: boolean) => {
            room.state.continuousMode = isContinuous;
            room.broadcastState();
        });

        // Public Room Viewer
        socket.on('request_public_rooms', () => {
             this.sendRoomViewerData(socket);
        });

        // Host Account Events
        socket.on('host_login', ({ username, password, geminiKey }: any) => {
            const host = HostManager.registerOrLogin(username, password, geminiKey);
            if (host) {
                socket.emit('host_login_success', host);
            } else {
                socket.emit('host_login_error', { message: 'Invalid credentials or login failed' });
            }
        });

        socket.on('get_host_key', ({ username, password }: any) => {
            const host = HostManager.registerOrLogin(username, password);
            if (host) {
                socket.emit('host_key_data', { geminiKey: host.geminiKey });
            }
        });

        // Admin Analytics
        socket.on('admin_login', ({ password }: any) => {
            if (password === 'Zawe1234!') {
                socket.emit('admin_login_success');
            } else {
                socket.emit('admin_login_error', { message: 'Incorret password' });
            }
        });

        socket.on('request_analytics', ({ password }: any) => {
            if (password === 'Zawe1234!') {
                const stats = AnalyticsManager.getStats();
                const activePlayers = Array.from(this.rooms.values()).reduce((acc, r) => acc + Object.keys(r.state.players).length, 0);
                const activeRooms = this.rooms.size;
                
                socket.emit('analytics_data', {
                    ...stats,
                    activePlayers,
                    activeRooms
                });
            }
        });
    }

    private sendRoomViewerData(socket: Socket) {
        const roomData = Array.from(this.rooms.values()).map(r => ({
            code: r.state.roomCode,
            players: Object.keys(r.state.players).length,
            status: r.state.status,
            game: r.state.currentGame,
            lastActivity: r.lastActivity,
            isPublic: !!r.state.isPublic
        }));
        socket.emit('room_viewer_data', roomData);
    }

    private destroyRoom(code: string) {
        const room = this.rooms.get(code);
        if (room) {
            room.cleanup();
            this.rooms.delete(code);
            console.log(`Room destroyed: ${code}`);
        }
    }

    private cleanupRooms() {
        const now = Date.now();
        
        for (const [code, room] of this.rooms.entries()) {
            const hasPlayers = Object.keys(room.state.players).length > 0;
            const idleTime = now - room.lastActivity;
            
            // Nuke empty rooms immediately if idle for just 60 seconds.
            // Nuke active rooms if idle for 60 minutes.
            if ((!hasPlayers && idleTime > 60 * 1000) || (idleTime > 60 * 60 * 1000)) {
                console.log(`Garbage collecting inactive room: ${code}`);
                this.destroyRoom(code);
            }
        }
    }
}
