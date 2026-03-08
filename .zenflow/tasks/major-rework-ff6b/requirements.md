# Product Requirements Document (PRD) - FamGame Overhaul

## 1. Project Overview
FamGame is a family-friendly party games platform inspired by Jackbox. It currently supports 14 different games and uses a real-time multiplayer architecture with React and Socket.io. The goal of this overhaul is to transform it into a polished, professional-grade platform with immersive audio, voice chat, and buttery-smooth UI/UX.

## 2. Target Audience
Families and friends looking for easy-to-play, engaging, and high-energy party games that can be played on a big screen (TV) with phones as controllers.

## 3. Core Features & Improvements

### 3.1. Technical Foundation
- **Multi-Room Support**: Refactor the server to support multiple concurrent game rooms using room codes.
- **Robust Real-time Sync**: Improve Socket.io logic to handle disconnects, late joins, and state synchronization more reliably.
- **State Management**: Standardize global state on the client using Zustand or similar for better performance and predictability.

### 3.2. UI/UX Overhaul (Jackbox-Inspired)
- **Visual Style**: Vibrant colors, bold typography (Outfit/black weights), rounded cards, and heavy use of gradients.
- **Animations**: Extensive use of Framer Motion for transitions, entrance animations, and feedback loops.
- **Responsiveness**: Mobile-first design for controllers; high-definition layout for the Host (TV).
- **Feedback Loops**: Confetti on wins, screen shakes on errors, and instant score popups.
- **Loading States**: Replace blank screens with themed skeletons and "shimmer" effects.

### 3.3. Immersive Audio & Voice
- **Background Music**: Ambient lobby tracks and high-energy game tracks using Howler.js.
- **Sound Effects (SFX)**: Distinct sounds for buzzing, correct/incorrect answers, round transitions, and wins.
- **Voice Chat**: Integration of WebRTC (e.g., Simple-Peer) for optional in-game voice communication.

### 3.4. Game-Specific Enhancements
- **Refactoring**: Every game (Trivia, 2 Truths, Bluff, etc.) needs a code review and UI polish.
- **Content Expansion**: Integration of external APIs (like OpenAI or static high-quality datasets) for fresh prompts.
- **Dopamine Loops**: XP badges, streaks, and personalized feedback.

## 4. List of Games to Refactor
1.  **Bluff**: Lying game where players try to fool others.
2.  **Buzz In**: Speed-based buzzer game.
3.  **Chain Reaction**: Word association chain.
4.  **Compete**: Mini-game battles (tapping, typing).
5.  **Emoji Story**: Telling stories using only emojis.
6.  **Hot Takes**: Voting on controversial/funny opinions.
7.  **Mind Meld**: Trying to match answers with others.
8.  **Poll Party**: Group voting and "most likely to" games.
9.  **Reaction**: Testing reflexes.
10. **Speed Draw**: Quick drawing based on prompts.
11. **This or That**: Simple binary choice voting.
12. **Trivia**: Classic question and answer.
13. **Two Truths**: Guessing the lie among two truths.
14. **Word Race**: Typing words in a category as fast as possible.

## 5. Non-Functional Requirements
- **Performance**: < 1s load times for game modules.
- **Accessibility**: ARIA labels and high-contrast modes.
- **Security**: Basic input sanitization and rate-limiting on the server.

## 6. Assumptions & Constraints
- The project will continue to use React and Socket.io as its core.
- Voice chat will be peer-to-peer (WebRTC) to minimize server costs.
- Assets (sounds/music) will be royalty-free or procedurally generated where possible.
