# Full SDD workflow

## Configuration
- **Artifacts Path**: {@artifacts_path} → `.zenflow/tasks/{task_id}`

---

## Workflow Steps

### [x] Step: Requirements
<!-- chat-id: 0ba26181-f482-46f6-a429-dcb2edbe356b -->

Create a Product Requirements Document (PRD) based on the feature description.

1. Review existing codebase to understand current architecture and patterns
2. Analyze the feature definition and identify unclear aspects
3. Ask the user for clarifications on aspects that significantly impact scope or user experience
4. Make reasonable decisions for minor details based on context and conventions
5. If user can't clarify, make a decision, state the assumption, and continue

Save the PRD to `{@artifacts_path}/requirements.md`.

### [x] Step: Technical Specification

Create a technical specification based on the PRD in `{@artifacts_path}/requirements.md`.

1. Review existing codebase architecture and identify reusable components
2. Define the implementation approach

Save to `{@artifacts_path}/spec.md` with:
- Technical context (language, dependencies)
- Implementation approach referencing existing code patterns
- Source code structure changes
- Data model / API / interface changes
- Delivery phases (incremental, testable milestones)
- Verification approach using project lint/test commands

### [x] Step: Planning

Create a detailed implementation plan based on `{@artifacts_path}/spec.md`.

1. Break down the work into concrete tasks
2. Each task should reference relevant contracts and include verification steps
3. Replace the Implementation step below with the planned tasks

Rule of thumb for step size: each step should represent a coherent unit of work (e.g., implement a component, add an API endpoint, write tests for a module). Avoid steps that are too granular (single function) or too broad (entire feature).

If the feature is trivial and doesn't warrant full specification, update this workflow to remove unnecessary steps and explain the reasoning to the user.

Save to `{@artifacts_path}/plan.md`.

### [x] Step: Implementation: Foundation
- Install dependencies (Zustand, Howler, Lucide, etc.)
- Refactor server for Multi-Room support
- Setup Zustand store on client
- Configure Tailwind with new theme and fonts

### [x] Step: Implementation: Core UI & Shared Components
- Implement new Lobby and Game Selection screens
- Create shared game components (Timer, PlayerList, Leaderboard)
- Setup SoundService and basic BGM

### [x] Step: Implementation: Game Refactor (Part 1)
- Refactor Trivia, 2 Truths, Hot Takes, Poll Party, Buzz In, Word Race, Reaction

### [x] Step: Implementation: Game Refactor (Part 2)
- Refactor Emoji Story, Bluff, This or That, Speed Draw, Chain Reaction, Mind Meld, Compete

### [x] Step: Implementation: Voice Chat & Polish
- Integrate WebRTC for Voice Chat
- Add confetti, animations, and final UX polish
- Final bug fixes and edge case handling

### [x] Step: Verification & Deployment
- Run linting and type checks
- Create Playwright test script
- Prepare Vercel deployment guide
