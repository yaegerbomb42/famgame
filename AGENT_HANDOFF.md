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

## Current Deployments

| Component | Platform | URL |
|-----------|----------|-----|
| Client | Vercel | `gamewithfam.vercel.app` |
| Server | Render (Free Tier) | `famgame.onrender.com` |

A GitHub Actions workflow (`.github/workflows/keep-alive.yml`) pings the Render server every 14 minutes to prevent free-tier sleep.

---

## Environment Variables

### Client (`client/.env`)

```
VITE_SERVER_URL=https://your-server-domain.com
```

- At build time, Vite bakes this into the bundle
- Falls back to `https://famgame.onrender.com` if unset
- In dev mode (`localhost`), the client auto-connects to `http://localhost:3000`

### Server

```
PORT=3000                    # Optional, defaults to 3000
GEMINI_API_KEY=<your-key>    # Required for Mind Meld game (semantic similarity via Gemini API)
```

- The Gemini key is only needed for the Mind Meld game. Without it, Mind Meld falls back to exact string matching.

---

## Build & Deploy Commands

### Client (Static SPA)

```bash
cd client
npm install
npm run build    # Outputs to client/dist/
```

Deploy `client/dist/` to any static host (Vercel, Netlify, Cloudflare Pages, S3+CloudFront, etc).

The `client/vercel.json` configures SPA rewrites (all routes → `index.html`). For non-Vercel hosts, configure equivalent rewrite rules.

### Server (Node.js)

```bash
cd server
npm install
npm run build    # Compiles TS → server/dist/index.js
npm start        # Runs node dist/index.js
```

**Server requirements:**

- Node.js 18+
- Must support WebSockets (not all serverless platforms do)
- Must be a **long-running process** (game state is in-memory)
- Good options: Render, Railway, Fly.io, DigitalOcean App Platform, VPS

### Local Development

```bash
# From project root:
npm install
cd client && npm install && cd ..
cd server && npm install && cd ..
npm run dev    # Runs both client (Vite) + server (ts-node) via concurrently
```

---

## Moving to a Custom Domain

### Client

1. Deploy `client/dist/` to your static host
2. Point your domain DNS (A record or CNAME) to the host
3. Set `VITE_SERVER_URL` env var to point to wherever you deploy the server

### Server

1. Deploy the server to a WebSocket-capable host
2. Set `GEMINI_API_KEY` env var
3. Update server CORS if needed (currently allows all origins: `origin: "*"`)
4. Update the keep-alive workflow URL in `.github/workflows/keep-alive.yml` if using free-tier hosting

### Client URL References to Update

- `client/src/components/HostLogic.tsx` line 186 — `joinUrl` hardcoded to `gamewithfam.vercel.app`
- `client/src/components/HostLogic.tsx` line 229 — Display text says `gamewithfam.vercel.app`

These should be updated to your new domain so the QR code and join instructions are correct.

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
