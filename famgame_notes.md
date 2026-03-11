# Famgame Project Notes

## Critical Architecture & Design

- **State Management**: Uses a custom `useGameStore` (Zustand) and `GameContext` for real-time synchronization via Socket.IO.
- **AI Integration**: The `SwarmEngine` is a multi-provider abstraction layer. Always ensure `VITE_GEMINI_API_KEY` (and backups like Groq/Cerebras) are present in `.env`.
- **Narrator**: The V.I.C. narrator uses the browser's `speechSynthesis` API. It is hard-coded to prioritize premium/online voices for better quality.
- **Game Phases**: Keep an eye on the transition between `PLAYING` and `RESULTS`. The new `FINAL_SUBMISSION` phase is inserted before the final results reveal.

## UI/UX Standards

- **Aesthetic**: Sleek, modern, high-tech, neon, and glassmorphism. Use `framer-motion` for all transitions.
- **Responsiveness**: Mobile-first design for players. Host view must be cinematic and readable from a distance (large text).
- **Customization**: Players can submit topics (before Trivia) and game ideas (for the Final Boss).

## Common Issues & Tips

- **Socket Connectivity**: If games aren't starting, verify the `VITE_SERVER_URL` is set correctly for production vs local dev.
- **AI Generation**: If Swarm fails, check if the JSON returned by the LLM is properly formatted. The `server/index.ts` has specific regex to strip markdown code blocks.
- **Vibration**: Mobile player feedback uses `navigator.vibrate`. Ensure checking for its existence to prevent crashes on non-supported browsers (like some iOS Safari versions).
