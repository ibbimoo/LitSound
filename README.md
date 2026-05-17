# LitSound

LitSound is a mobile-first web MVP that turns music descriptions from books into playable AI-generated reading themes.

Users enter a book title, author, optional scene context, and a passage describing music. The app analyzes the book mood, separates music style from lyric intent, builds a generation prompt, and returns a playable mock audio track.

## Features

- Mobile-first single-column UI for 360px+ screens
- Book mood analysis from title, author, and optional summary
- Music-description parsing for tempo, instruments, mood, vocal style, and lyric seed
- Prompt composition for music generation
- Safety guard for long excerpts
- Rewrite guard for named artist imitation requests
- Mock music provider with local playable audio
- Regeneration controls for quick direction changes

## Tech Stack

- Next.js App Router
- React
- TypeScript
- Tailwind CSS
- Zod
- Vitest
- Playwright

## Getting Started

Install dependencies:

```bash
npm install
```

Run the local development server:

```bash
npm run dev
```

Open:

```txt
http://127.0.0.1:3000
```

## Scripts

```bash
npm test
npm run typecheck
npm run build
npm run e2e
```

## Vercel Deployment

This project is ready for Vercel with the default Next.js settings.

- Framework Preset: `Next.js`
- Install Command: `npm install`
- Build Command: `npm run build`
- Output Directory: leave empty

## Current MVP Scope

The current version uses a mock music provider:

```txt
public/audio/mock-track.wav
```

For a production music-generation provider, implement the external provider contract in:

```txt
src/lib/generation/externalMusicProvider.ts
```

and configure:

```txt
MUSIC_PROVIDER_MODE=external
MUSIC_PROVIDER_API_URL=...
MUSIC_PROVIDER_API_KEY=...
```

## Documentation

- Product Requirements: `docs/book-music-generation-prd.md`
- Implementation Plan: `plan.md`
- PRD Traceability: `docs/prd-traceability.md`
