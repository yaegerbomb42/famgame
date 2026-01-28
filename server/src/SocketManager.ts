import { Server, Socket } from 'socket.io';
import { RoomManager } from './managers/RoomManager';

export class SocketManager {
    private io: Server;
    private roomManager: RoomManager;

    constructor(io: Server) {
        this.io = io;
        this.roomManager = new RoomManager(io);
    }

    public initialize() {
        this.io.on('connection', (socket: Socket) => {
            console.log('Client connected:', socket.id);

            // Send initial state
            socket.emit('gameState', this.roomManager.state);

            this.handleSocketEvents(socket);
        });
    }

    private handleSocketEvents(socket: Socket) {
        // Room Events
        socket.on('createRoom', ({ name }: { name: string }) => {
            this.roomManager.handleCreateRoom(socket, name);
        });

        socket.on('joinRoom', ({ name, code, avatar }: { name: string, code: string, avatar?: string }) => {
            this.roomManager.handleJoinRoom(socket, name || 'Guest', code, avatar || '🙂');
        });

        socket.on('leaveRoom', () => {
            this.roomManager.handleDisconnect(socket.id);
        });

        socket.on('disconnect', () => {
            this.roomManager.handleDisconnect(socket.id);
        });

        // Game Flow
        socket.on('startGame', () => {
            this.roomManager.startGameSelect();
        });

        socket.on('voteGame', (gameId: string) => {
            this.roomManager.handleVote(socket.id, gameId);
        });

        socket.on('selectGame', (gameId: any) => {
            this.roomManager.selectGame(gameId);
        });

        socket.on('backToLobby', () => {
            // Reset to lobby
            this.roomManager.state.status = 'GAME_SELECT';
            this.roomManager.state.currentGame = undefined;
            this.roomManager.state.gameData = undefined;
            this.roomManager.broadcastState();
        });

        // Game Specific Inputs
        socket.on('submitAnswer', (answerIndex: number) => {
            this.roomManager.handleInput(socket.id, { answerIndex });
        });

        // Add other event handlers here as we port games
    }
}
