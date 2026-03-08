# Technical Specification - FamGame Overhaul

## 1. Technical Context
- **Frontend**: React 19, Vite, Tailwind CSS, Framer Motion, Zustand (state), Howler.js (audio), simple-peer (WebRTC).
- **Backend**: Node.js, Express, Socket.io.
- **Tools**: TypeScript, Lucide React (icons), Shadcn/UI.

## 2. Server Architecture: Multi-Room Support
The current server uses a single global `gameState`. This will be refactored to support multiple rooms.

### 2.1. Room Management
- A `rooms` object (or Map) will store state per room code: `Record<string, RoomState>`.
- `RoomState` will include:
    - `roomCode`: 4-character uppercase string.
    - `players`: Map of socket IDs to player data.
    - `status`: Lobby, Game Select, Playing, Results.
    - `currentGame`: Current game ID.
    - `gameData`: Game-specific state.
    - `timer`: Reference to active timer.

### 2.2. Socket Logic Refactor
- All events from players will include (or be associated with) a `roomCode`.
- Sockets will join a room using `socket.join(roomCode)`.
- `io.to(roomCode).emit(...)` will be used for broadcasting within a room.

## 3. Client Architecture: State & UI

### 3.1. State Management (Zustand)
- A central store `useGameStore` to hold the current `gameState`, `me` (player info), and `socket` instance.
- Sync state from server via `gameState` socket events.

### 3.2. UI/UX Polish
- **Tailwind Config**: Extend with neon colors and custom font "Outfit".
- **Shadcn/UI**: Install and use for consistent, accessible components.
- **Framer Motion**: Global `AnimatePresence` for route transitions and game state changes.

### 3.3. Audio Service
- `SoundService` class using Howler.js.
- Methods: `playBGM(track)`, `stopBGM()`, `playSFX(sound)`.
- Preload assets in the background.

## 4. Voice Chat Implementation
- Use `simple-peer` for Mesh WebRTC.
- When a game starts, the Host initiates a signaling process for players to connect to each other (or just the Host).
- Limit to voice only to preserve bandwidth.

## 5. Game Refactoring Plan
For each of the 14 games:
1.  **Shared Components**: Create reusable components for timers, player lists, and results.
2.  **UI Migration**: Move away from inline styles to Tailwind and Shadcn/UI.
3.  **Real-time Optimization**: Ensure inputs are validated and state updates are efficient.
4.  **Feedback**: Add SFX and animations for key actions (e.g., buzzing in, submitting answers).

## 6. Delivery Phases
1.  **Phase 1: Foundation**: Multi-room server support + Zustand store + Shadcn setup.
2.  **Phase 2: Core UX**: New Lobby & Game Selection screens + Audio Service.
3.  **Phase 3: Game Refactor (Batch 1-7)**: First half of the games.
4.  **Phase 4: Game Refactor (Batch 8-14)**: Second half of the games.
5.  **Phase 5: Voice Chat & Final Polish**: WebRTC integration + confetti/particles + final bug fixes.

## 7. Verification Approach
- **Linting**: `npm run lint` in both client and server.
- **Manual Testing**: Multi-tab testing (1 Host, 2+ Players).
- **Automated Testing**: Playwright script to simulate a full game loop.
