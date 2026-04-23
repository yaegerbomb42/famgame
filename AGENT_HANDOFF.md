# AGENT_HANDOFF.md — FamGame Deployment Guide

## Architecture

```
famgame/
├── client/          ← Vite + React + TypeScript (static SPA)
│   └── .env         ← VITE_SERVER_URL (server WebSocket endpoint)
├── server/          ← Express + Socket.IO (Node.js WebSocket server)
│   └── index.ts     ← Single-file server, all game logic
└── package.json     ← Root scripts (concurrently runs both)
```

**Client** is a static SPA — no server-side rendering. It connects to the server via Socket.IO WebSockets.

**Server** is a stateful Node.js process. Game state lives in memory (single `gameState` object). It must run as a **persistent process** (not serverless/lambda).

---

## Deployment Status (Yaeger Network VPS)

| Component | Host | URL |
|-----------|------|-----|
| Client | VPS (Nginx) | `https://gamewithfam.com` |
| Server | VPS (Docker) | `https://gamewithfam.com/socket.io/` |

---

---

## Environment Variables

### Client (`client/.env`)

- **Auto-detection**: The client uses `window.location.origin` by default in production.
- **Manual Override**: Set `VITE_SERVER_URL` if the backend is on a different domain.
- **Local Dev**: Defaults to `http://localhost:3003`.

### Server

```
PORT=3000                    # Optional, defaults to 3000
GEMINI_API_KEY=<your-key>    # Required for Mind Meld game (semantic similarity via Gemini API)
```

- The Gemini key is only needed for the Mind Meld game. Without it, Mind Meld falls back to exact string matching.

---

## Deployment Strategy (Universal Deploy)

The project is managed via the **Yaeger Network Universal Deploy Script**.

### Frontend Deployment
Run `./deploy.sh gamewithfam --client`.
- Builds the Vite app.
- Rsyncs `dist/` to the VPS.
- Atomically swaps the `current` symlink.
- Reloads Nginx.

### Backend Deployment
Run `./deploy.sh gamewithfam --server`.
- Syncs the `server/` directory.
- Rebuilds the Docker image.
- Performs a Blue-Green handover.

### Full Deployment
Run `./deploy.sh gamewithfam`.

### Local Development

```bash
# From project root:
npm install
cd client && npm install && cd ..
cd server && npm install && cd ..
npm run dev    # Runs both client (Vite) + server (ts-node) via concurrently
```

---

## Game Registration (Adding New Games)

Games must be registered in **3 places**:

1. `client/src/App.tsx` — `GAME_MODES` array (landing page display)
2. `client/src/components/HostLogic.tsx` — `GAMES` array + import + render block
3. `client/src/components/PlayerLogic.tsx` — import + render block
4. `server/index.ts` — `selectGame` handler + game-specific socket events

Each game has a `games/<name>/Host.tsx` and `games/<name>/Player.tsx`.

---

## Known Issues & Gotchas

- **In-memory state**: Server restart = all active games lost. No persistence layer exists.
- **Single server**: Only one game room can exist at a time (single `gameState` object).
- **`gameData` is `any`**: Works but not type-safe.
- **No tests**: No unit or integration tests exist.
- **Tailwind**: Client uses Tailwind CSS (config in `client/tailwind.config.js`).
- **Framer Motion**: Used for animations throughout the client.
- **Brain Burst auto-chains**: Brain Burst → Global Averages → Skill Showdown (automatic game flow).

---

## Tech Stack Summary

| Layer | Tech |
|-------|------|
| Frontend | React 19, TypeScript, Vite 7, Tailwind CSS, Framer Motion |
| Backend | Express 4, Socket.IO 4, TypeScript (ts-node for dev) |
| AI | Gemini 2.0 Flash (Mind Meld similarity only) |
| Audio | Web Audio API (synthesized sounds, no audio files) |
| Speech | Web Speech API (Brain Burst narrator) |
