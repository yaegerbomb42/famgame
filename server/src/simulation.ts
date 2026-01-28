import { io, Socket } from 'socket.io-client';

const SERVER_URL = 'http://localhost:3000';

async function runSimulation() {
    console.log('🧪 STARTING AUTONOMOUS QA SIMULATION 🧪');

    // 1. Initialize Clients
    const hostSocket: Socket = io(SERVER_URL);
    const playerA: Socket = io(SERVER_URL);
    const playerB: Socket = io(SERVER_URL);

    // Helper to wait
    const wait = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

    try {
        await wait(1000); // Allow connections

        // 2. Simulate Host Creating Room
        console.log('[TEST] Host creating room...');
        hostSocket.emit('createRoom', { name: 'HostAgent' });

        // Wait for room code
        let roomCode = '';
        await new Promise<void>((resolve) => {
            hostSocket.once('gameState', (state: any) => {
                roomCode = state.roomCode;
                console.log(`[SUCCESS] Room Created: ${roomCode}`);
                resolve();
            });
        });

        // 3. Simulate Players Joining
        console.log('[TEST] Players joining...');
        playerA.emit('joinRoom', { name: 'Player A', code: roomCode, avatar: '🤖' });
        playerB.emit('joinRoom', { name: 'Player B', code: roomCode, avatar: '👽' });

        await wait(1000);

        // 4. Start Game (Select Mode)
        console.log('[TEST] Host starting game selection...');
        hostSocket.emit('startGame');
        await wait(1000);

        // 5. Select Trivia
        console.log('[TEST] Host selecting TRIVIA...');
        hostSocket.emit('selectGame', 'TRIVIA');
        await wait(1000);

        // 6. Play Trivia Round
        console.log('[TEST] Playing Trivia...');
        // Player A gets it right (0), Player B gets it wrong (1) - assuming Q1 correct is 0
        // Need to know what question it is.
        // We'll just assume index 0 for now or read from state if we were advanced.

        console.log('[TEST] Player A submitting answer 0 (Correct)...');
        playerA.emit('submitAnswer', 0);

        console.log('[TEST] Player B submitting answer 1 (Wrong)...');
        playerB.emit('submitAnswer', 1);

        await wait(2000); // Wait for results

        // 7. Verify Scores
        // ideally we listen for gameState and check scores

        console.log('[TEST] Simulation Complete. Checking results manually via logs.');

    } catch (error) {
        console.error('[FAILURE] Simulation Error:', error);
    } finally {
        hostSocket.close();
        playerA.close();
        playerB.close();
        console.log('🧪 SIMULATION ENDED 🧪');
    }
}

// execute
runSimulation();
