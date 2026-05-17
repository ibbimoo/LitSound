# LitSound MVP Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a mobile-first web MVP that turns a book title, author, and music-description excerpt into structured music direction, generates an audio track, and lets the user play or regenerate it.

**Architecture:** Use a thin vertical slice first: mobile single-column form input -> analysis API -> editable analysis result -> generation API -> sticky-friendly audio player. Keep AI analysis, music prompt composition, safety checks, and audio generation behind small service interfaces so a mock provider can be swapped for a real music-generation provider without changing the UI.

**Tech Stack:** Next.js App Router, TypeScript, React, Tailwind CSS, Vitest, Testing Library, Playwright, server-side service modules, provider adapter pattern.

---

## Source Product Spec

- PRD: `docs/book-music-generation-prd.md`

## Implementation Assumptions

- The first executable MVP will be a web app.
- The first executable MVP is mobile-first. Primary verification uses 390x844 and 360x800 viewport sizes before desktop polish.
- The initial generator will support two modes:
  - `mock`: returns a bundled sample audio file for local development and tests.
  - `external`: calls a configured music-generation API through `MUSIC_PROVIDER_API_URL` and `MUSIC_PROVIDER_API_KEY`.
- The UI must label generated tracks as AI-generated and must not claim affiliation with the original book, author, artist, or publisher.
- Long excerpts are blocked at 1,500 characters in the UI and API to reduce copyright risk.
- Requests that ask for a living or named artist imitation are rewritten into generic music traits before generation.
- This workspace is not currently a git repository. Commit steps in this plan are skipped unless a git repository is initialized later; each task still requires file verification before moving on.

## File Structure

### Create

- `package.json` - scripts and dependencies.
- `tsconfig.json` - TypeScript settings.
- `next.config.mjs` - Next.js configuration.
- `postcss.config.mjs` - PostCSS pipeline for Tailwind.
- `tailwind.config.ts` - Tailwind content paths and theme.
- `vitest.config.ts` - unit test configuration.
- `playwright.config.ts` - end-to-end test configuration.
- `app/layout.tsx` - root app shell.
- `app/page.tsx` - main LitSound workflow UI.
- `app/globals.css` - global styles and Tailwind base.
- `app/api/analyze/route.ts` - API route for book and excerpt analysis.
- `app/api/generate/route.ts` - API route for music generation.
- `src/types/litsound.ts` - shared domain types.
- `src/lib/analysis/analyzeBookContext.ts` - book-context analysis.
- `src/lib/analysis/analyzeMusicDescription.ts` - music-description parsing.
- `src/lib/analysis/buildGenerationPrompt.ts` - prompt composer.
- `src/lib/safety/sanitizeExcerpt.ts` - excerpt length and storage-safety guard.
- `src/lib/safety/rewriteArtistImitation.ts` - artist imitation guard.
- `src/lib/generation/MusicProvider.ts` - provider interface.
- `src/lib/generation/mockMusicProvider.ts` - local deterministic audio provider.
- `src/lib/generation/externalMusicProvider.ts` - external provider adapter.
- `src/lib/generation/getMusicProvider.ts` - provider selection.
- `src/components/BookInputForm.tsx` - book and excerpt form.
- `src/components/AnalysisReview.tsx` - editable analysis result.
- `src/components/GenerationOptions.tsx` - duration, lyrics, and adjustment controls.
- `src/components/TrackPlayer.tsx` - audio player and metadata display.
- `src/components/RegenerationControls.tsx` - quick direction changes.
- `public/audio/mock-track.mp3` - bundled local audio for development.
- `tests/unit/analysis.test.ts` - analysis and prompt tests.
- `tests/unit/safety.test.ts` - copyright and artist-imitation tests.
- `tests/unit/generation.test.ts` - provider selection and generation tests.
- `tests/e2e/litsound-flow.spec.ts` - browser flow test.

## Task 1: Project Scaffold

**Files:**
- Create: `package.json`
- Create: `tsconfig.json`
- Create: `next.config.mjs`
- Create: `postcss.config.mjs`
- Create: `tailwind.config.ts`
- Create: `vitest.config.ts`
- Create: `playwright.config.ts`
- Create: `app/layout.tsx`
- Create: `app/globals.css`

- [ ] **Step 1: Create package configuration**

Create `package.json`:

```json
{
  "name": "litsound-mvp",
  "version": "0.1.0",
  "private": true,
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "test": "vitest run",
    "test:watch": "vitest",
    "e2e": "playwright test",
      "lint": "next lint",
      "typecheck": "tsc --noEmit"
  },
  "dependencies": {
    "lucide-react": "^0.468.0",
    "next": "^15.0.0",
    "react": "^19.0.0",
    "react-dom": "^19.0.0",
    "zod": "^3.24.0"
  },
  "devDependencies": {
    "@playwright/test": "^1.49.0",
    "@testing-library/jest-dom": "^6.6.0",
    "@testing-library/react": "^16.1.0",
    "@types/node": "^22.10.0",
    "@types/react": "^19.0.0",
    "@types/react-dom": "^19.0.0",
    "@vitejs/plugin-react": "^5.0.0",
    "autoprefixer": "^10.4.20",
    "jsdom": "^25.0.0",
    "postcss": "^8.4.49",
    "tailwindcss": "^3.4.17",
    "typescript": "^5.7.0",
    "vitest": "^2.1.8"
  }
}
```

- [ ] **Step 2: Create TypeScript and framework config**

Create `tsconfig.json`:

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "lib": ["dom", "dom.iterable", "ES2022"],
    "allowJs": false,
    "skipLibCheck": true,
    "strict": true,
    "noEmit": true,
    "esModuleInterop": true,
    "module": "esnext",
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "preserve",
    "incremental": true,
    "baseUrl": ".",
    "paths": {
      "@/*": ["./src/*"]
    }
  },
  "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx"],
  "exclude": ["node_modules"]
}
```

Create `next.config.mjs`:

```js
/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true
};

export default nextConfig;
```

Create `postcss.config.mjs`:

```js
const config = {
  plugins: {
    tailwindcss: {},
    autoprefixer: {}
  }
};

export default config;
```

Create `tailwind.config.ts`:

```ts
import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./src/**/*.{ts,tsx}"
  ],
  theme: {
    extend: {}
  },
  plugins: []
};

export default config;
```

Create `vitest.config.ts`:

```ts
import react from "@vitejs/plugin-react";
import { defineConfig } from "vitest/config";

export default defineConfig({
  plugins: [react()],
  test: {
    environment: "jsdom",
    globals: true,
    include: ["tests/unit/**/*.test.ts", "tests/unit/**/*.test.tsx"]
  },
  resolve: {
    alias: {
      "@": new URL("./src", import.meta.url).pathname
    }
  }
});
```

Create `playwright.config.ts`:

```ts
import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "./tests/e2e",
  use: {
    baseURL: "http://127.0.0.1:3000",
    trace: "on-first-retry"
  },
  webServer: {
    command: "npm run dev",
    url: "http://127.0.0.1:3000",
    reuseExistingServer: true,
    timeout: 120000
  },
  projects: [
    {
      name: "mobile-chrome",
      use: {
        ...devices["Pixel 5"],
        viewport: { width: 390, height: 844 }
      }
    },
    {
      name: "small-mobile",
      use: {
        ...devices["Galaxy S8"],
        viewport: { width: 360, height: 800 }
      }
    }
  ]
});
```

- [ ] **Step 3: Create root layout and global styles**

Create `app/layout.tsx`:

```tsx
import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "LitSound",
  description: "Turn music descriptions from books into playable AI-generated tracks."
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko">
      <body>{children}</body>
    </html>
  );
}
```

Create `app/globals.css`:

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

:root {
  color-scheme: light;
  background: #f6f3ee;
  color: #1e1b18;
}

body {
  margin: 0;
  min-height: 100vh;
  font-family: Arial, Helvetica, sans-serif;
}

button,
input,
textarea,
select {
  font: inherit;
}
```

- [ ] **Step 4: Install dependencies**

Run: `npm install`

Expected: dependencies install and `package-lock.json` is created.

- [ ] **Step 5: Verify scaffold**

Run: `npm run build`

Expected: Next.js build starts and fails only if a required source file is missing. If `app/page.tsx` is missing, continue to Task 6 before re-running build.

- [ ] **Step 6: Commit scaffold**

```bash
git add package.json package-lock.json tsconfig.json next.config.mjs postcss.config.mjs tailwind.config.ts vitest.config.ts playwright.config.ts app/layout.tsx app/globals.css
git commit -m "chore: scaffold LitSound app"
```

## Task 2: Domain Types

**Files:**
- Create: `src/types/litsound.ts`
- Test: `tests/unit/analysis.test.ts`

- [ ] **Step 1: Write type usage test**

Create `tests/unit/analysis.test.ts`:

```ts
import { describe, expect, it } from "vitest";
import type { BookContext, MusicDescriptionAnalysis } from "@/types/litsound";

describe("LitSound domain types", () => {
  it("supports book context and music analysis shapes", () => {
    const book: BookContext = {
      title: "Example Novel",
      author: "Example Author",
      optionalSummary: "A winter story about memory.",
      inferredGenre: "literary fiction",
      inferredMood: ["melancholic", "intimate"],
      inferredPeriod: "contemporary",
      confidence: 0.72
    };

    const analysis: MusicDescriptionAnalysis = {
      rawText: "A slow piano waltz drifted through the old room.",
      styleKeywords: ["slow waltz", "intimate piano"],
      instruments: ["piano"],
      tempo: "slow",
      mood: ["nostalgic"],
      vocalStyle: "instrumental",
      lyricsDetected: false,
      lyricSeed: "",
      sceneContext: ["old room"],
      confidence: 0.81
    };

    expect(book.inferredMood).toContain("melancholic");
    expect(analysis.instruments).toEqual(["piano"]);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test -- tests/unit/analysis.test.ts`

Expected: FAIL because `src/types/litsound.ts` does not exist.

- [ ] **Step 3: Create shared domain types**

Create `src/types/litsound.ts`:

```ts
export type Tempo = "very slow" | "slow" | "medium" | "fast" | "very fast";

export type VocalStyle =
  | "instrumental"
  | "soft vocal"
  | "clear vocal"
  | "whispered vocal"
  | "rough vocal"
  | "choir";

export type BookContext = {
  title: string;
  author: string;
  optionalSummary: string;
  inferredGenre: string;
  inferredMood: string[];
  inferredPeriod: string;
  confidence: number;
};

export type MusicDescriptionAnalysis = {
  rawText: string;
  styleKeywords: string[];
  instruments: string[];
  tempo: Tempo;
  mood: string[];
  vocalStyle: VocalStyle;
  lyricsDetected: boolean;
  lyricSeed: string;
  sceneContext: string[];
  confidence: number;
};

export type GenerationOptions = {
  includeLyrics: boolean;
  durationSeconds: 30 | 60 | 90;
  adjustments: string[];
  bookMoodWeight: "low" | "medium" | "high";
};

export type GenerationRequest = {
  bookContext: BookContext;
  musicDescriptionAnalysis: MusicDescriptionAnalysis;
  options: GenerationOptions;
  prompt: string;
};

export type GeneratedTrack = {
  id: string;
  audioUrl: string;
  title: string;
  description: string;
  durationSeconds: number;
  generationStatus: "queued" | "processing" | "complete" | "failed";
  createdAt: string;
  sourceBookTitle: string;
  sourceAuthor: string;
};
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npm test -- tests/unit/analysis.test.ts`

Expected: PASS.

- [ ] **Step 5: Commit domain types**

```bash
git add src/types/litsound.ts tests/unit/analysis.test.ts
git commit -m "feat: add LitSound domain types"
```

## Task 3: Safety Guards

**Files:**
- Create: `src/lib/safety/sanitizeExcerpt.ts`
- Create: `src/lib/safety/rewriteArtistImitation.ts`
- Test: `tests/unit/safety.test.ts`

- [ ] **Step 1: Write failing safety tests**

Create `tests/unit/safety.test.ts`:

```ts
import { describe, expect, it } from "vitest";
import { rewriteArtistImitation } from "@/lib/safety/rewriteArtistImitation";
import { sanitizeExcerpt } from "@/lib/safety/sanitizeExcerpt";

describe("sanitizeExcerpt", () => {
  it("trims whitespace and accepts short excerpts", () => {
    expect(sanitizeExcerpt("  slow piano in a dark room  ")).toBe("slow piano in a dark room");
  });

  it("rejects excerpts over 1500 characters", () => {
    expect(() => sanitizeExcerpt("a".repeat(1501))).toThrow("Excerpt must be 1500 characters or fewer.");
  });
});

describe("rewriteArtistImitation", () => {
  it("rewrites named artist imitation into generic traits", () => {
    const result = rewriteArtistImitation("Make this sound like Taylor Swift with bright pop vocals.");

    expect(result.rewrittenPrompt).toContain("bright pop vocals");
    expect(result.rewrittenPrompt).not.toContain("Taylor Swift");
    expect(result.wasRewritten).toBe(true);
  });

  it("leaves generic style prompts unchanged", () => {
    const result = rewriteArtistImitation("slow chamber folk with muted strings");

    expect(result.rewrittenPrompt).toBe("slow chamber folk with muted strings");
    expect(result.wasRewritten).toBe(false);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test -- tests/unit/safety.test.ts`

Expected: FAIL because safety modules do not exist.

- [ ] **Step 3: Implement excerpt guard**

Create `src/lib/safety/sanitizeExcerpt.ts`:

```ts
const MAX_EXCERPT_LENGTH = 1500;

export function sanitizeExcerpt(input: string): string {
  const excerpt = input.trim();

  if (excerpt.length === 0) {
    throw new Error("Excerpt is required.");
  }

  if (excerpt.length > MAX_EXCERPT_LENGTH) {
    throw new Error("Excerpt must be 1500 characters or fewer.");
  }

  return excerpt;
}
```

- [ ] **Step 4: Implement artist-imitation rewrite**

Create `src/lib/safety/rewriteArtistImitation.ts`:

```ts
const BLOCKED_ARTIST_PATTERNS = [
  /Taylor Swift/gi,
  /BTS/gi,
  /Billie Eilish/gi,
  /IU/gi,
  /Adele/gi,
  /Radiohead/gi
];

export type ArtistRewriteResult = {
  rewrittenPrompt: string;
  wasRewritten: boolean;
};

export function rewriteArtistImitation(prompt: string): ArtistRewriteResult {
  let rewrittenPrompt = prompt;
  let wasRewritten = false;

  for (const pattern of BLOCKED_ARTIST_PATTERNS) {
    if (pattern.test(rewrittenPrompt)) {
      rewrittenPrompt = rewrittenPrompt.replace(pattern, "a non-imitative contemporary music style");
      wasRewritten = true;
    }
  }

  return {
    rewrittenPrompt,
    wasRewritten
  };
}
```

- [ ] **Step 5: Run safety tests**

Run: `npm test -- tests/unit/safety.test.ts`

Expected: PASS.

- [ ] **Step 6: Commit safety guards**

```bash
git add src/lib/safety tests/unit/safety.test.ts
git commit -m "feat: add excerpt and artist safety guards"
```

## Task 4: Analysis Services

**Files:**
- Create: `src/lib/analysis/analyzeBookContext.ts`
- Create: `src/lib/analysis/analyzeMusicDescription.ts`
- Modify: `tests/unit/analysis.test.ts`

- [ ] **Step 1: Add failing analysis tests**

Append to `tests/unit/analysis.test.ts`:

```ts
import { analyzeBookContext } from "@/lib/analysis/analyzeBookContext";
import { analyzeMusicDescription } from "@/lib/analysis/analyzeMusicDescription";

describe("analyzeBookContext", () => {
  it("infers mood and genre from book metadata and summary", () => {
    const result = analyzeBookContext({
      title: "The Winter Archive",
      author: "Mina Park",
      optionalSummary: "A quiet literary novel about grief, memory, snow, and an old house."
    });

    expect(result.title).toBe("The Winter Archive");
    expect(result.author).toBe("Mina Park");
    expect(result.inferredGenre).toBe("literary fiction");
    expect(result.inferredMood).toContain("melancholic");
  });
});

describe("analyzeMusicDescription", () => {
  it("separates style, instruments, tempo, mood, and lyric seed", () => {
    const result = analyzeMusicDescription(
      "She sang a slow, cracked song about never forgetting the sea while an old piano played."
    );

    expect(result.tempo).toBe("slow");
    expect(result.instruments).toContain("piano");
    expect(result.lyricsDetected).toBe(true);
    expect(result.lyricSeed).toContain("never forgetting the sea");
  });
});
```

- [ ] **Step 2: Run analysis tests to verify failure**

Run: `npm test -- tests/unit/analysis.test.ts`

Expected: FAIL because analysis modules do not exist.

- [ ] **Step 3: Implement book-context analyzer**

Create `src/lib/analysis/analyzeBookContext.ts`:

```ts
import type { BookContext } from "@/types/litsound";

type BookContextInput = {
  title: string;
  author: string;
  optionalSummary?: string;
};

export function analyzeBookContext(input: BookContextInput): BookContext {
  const summary = input.optionalSummary?.trim() ?? "";
  const combined = `${input.title} ${input.author} ${summary}`.toLowerCase();

  const inferredMood = new Set<string>();
  if (/(grief|memory|winter|snow|lonely|quiet|old house)/.test(combined)) {
    inferredMood.add("melancholic");
    inferredMood.add("intimate");
  }
  if (/(mystery|murder|detective|secret)/.test(combined)) {
    inferredMood.add("tense");
  }
  if (/(romance|love|letter|wedding)/.test(combined)) {
    inferredMood.add("romantic");
  }
  if (inferredMood.size === 0) {
    inferredMood.add("reflective");
  }

  const inferredGenre = /(literary|grief|memory|quiet)/.test(combined)
    ? "literary fiction"
    : /(mystery|detective|murder)/.test(combined)
      ? "mystery"
      : /(fantasy|kingdom|magic|dragon)/.test(combined)
        ? "fantasy"
        : "general fiction";

  const inferredPeriod = /(victorian|19th|old manor|carriage)/.test(combined)
    ? "historical"
    : "contemporary";

  return {
    title: input.title.trim(),
    author: input.author.trim(),
    optionalSummary: summary,
    inferredGenre,
    inferredMood: Array.from(inferredMood),
    inferredPeriod,
    confidence: summary.length > 20 ? 0.76 : 0.58
  };
}
```

- [ ] **Step 4: Implement music-description analyzer**

Create `src/lib/analysis/analyzeMusicDescription.ts`:

```ts
import type { MusicDescriptionAnalysis, Tempo, VocalStyle } from "@/types/litsound";

export function analyzeMusicDescription(rawText: string): MusicDescriptionAnalysis {
  const text = rawText.trim();
  const lower = text.toLowerCase();

  const instruments = [
    ["piano", /piano|피아노/],
    ["strings", /strings|violin|cello|현악|바이올린|첼로/],
    ["brass", /brass|trumpet|horn|트럼펫|금관/],
    ["guitar", /guitar|기타/],
    ["drums", /drum|percussion|드럼|타악/]
  ]
    .filter(([, pattern]) => (pattern as RegExp).test(lower))
    .map(([instrument]) => instrument as string);

  const tempo: Tempo = /very slow|느릿느릿|아주 느/.test(lower)
    ? "very slow"
    : /slow|느린|느리게/.test(lower)
      ? "slow"
      : /fast|빠른|빠르게/.test(lower)
        ? "fast"
        : "medium";

  const mood = new Set<string>();
  if (/(sad|lonely|cracked|흐릿|쓸쓸|슬픈)/.test(lower)) mood.add("melancholic");
  if (/(warm|soft|따뜻|부드러운)/.test(lower)) mood.add("warm");
  if (/(dark|tense|어두운|불안)/.test(lower)) mood.add("tense");
  if (mood.size === 0) mood.add("reflective");

  const vocalStyle: VocalStyle = /(sang|song|voice|노래|목소리|불렀)/.test(lower)
    ? /(cracked|rough|쉰)/.test(lower)
      ? "rough vocal"
      : "soft vocal"
    : "instrumental";

  const lyricMatch = text.match(/about ([^.]+?)( while| with|$)/i);
  const lyricsDetected = /(lyric|sang|song about|가사|노래|불렀)/.test(lower);

  return {
    rawText: text,
    styleKeywords: [tempo, ...Array.from(mood), vocalStyle].filter(Boolean),
    instruments: instruments.length > 0 ? instruments : ["piano"],
    tempo,
    mood: Array.from(mood),
    vocalStyle,
    lyricsDetected,
    lyricSeed: lyricMatch?.[1]?.trim() ?? "",
    sceneContext: extractSceneContext(lower),
    confidence: text.length > 40 ? 0.78 : 0.62
  };
}

function extractSceneContext(lower: string): string[] {
  const context: string[] = [];
  if (/old room|old house|낡은 방|오래된 집/.test(lower)) context.push("old interior");
  if (/sea|ocean|바다/.test(lower)) context.push("sea memory");
  if (/bar|pub|술집/.test(lower)) context.push("small bar");
  return context.length > 0 ? context : ["unspecified scene"];
}
```

- [ ] **Step 5: Run analysis tests**

Run: `npm test -- tests/unit/analysis.test.ts`

Expected: PASS.

- [ ] **Step 6: Commit analysis services**

```bash
git add src/lib/analysis/analyzeBookContext.ts src/lib/analysis/analyzeMusicDescription.ts tests/unit/analysis.test.ts
git commit -m "feat: add book and music analysis services"
```

## Task 5: Prompt Composition

**Files:**
- Create: `src/lib/analysis/buildGenerationPrompt.ts`
- Modify: `tests/unit/analysis.test.ts`

- [ ] **Step 1: Add failing prompt test**

Append to `tests/unit/analysis.test.ts`:

```ts
import { buildGenerationPrompt } from "@/lib/analysis/buildGenerationPrompt";

describe("buildGenerationPrompt", () => {
  it("combines book context, music analysis, and generation options", () => {
    const bookContext = analyzeBookContext({
      title: "The Winter Archive",
      author: "Mina Park",
      optionalSummary: "A quiet literary novel about grief and snow."
    });
    const musicDescriptionAnalysis = analyzeMusicDescription(
      "A slow piano song about never forgetting the sea."
    );

    const prompt = buildGenerationPrompt({
      bookContext,
      musicDescriptionAnalysis,
      options: {
        includeLyrics: true,
        durationSeconds: 60,
        adjustments: ["more dark"],
        bookMoodWeight: "high"
      }
    });

    expect(prompt).toContain("literary fiction");
    expect(prompt).toContain("slow");
    expect(prompt).toContain("piano");
    expect(prompt).toContain("include original lyrics inspired by: never forgetting the sea");
  });
});
```

- [ ] **Step 2: Run test to verify failure**

Run: `npm test -- tests/unit/analysis.test.ts`

Expected: FAIL because prompt composer does not exist.

- [ ] **Step 3: Implement prompt composer**

Create `src/lib/analysis/buildGenerationPrompt.ts`:

```ts
import type { BookContext, GenerationOptions, MusicDescriptionAnalysis } from "@/types/litsound";
import { rewriteArtistImitation } from "@/lib/safety/rewriteArtistImitation";

type PromptInput = {
  bookContext: BookContext;
  musicDescriptionAnalysis: MusicDescriptionAnalysis;
  options: GenerationOptions;
};

export function buildGenerationPrompt(input: PromptInput): string {
  const { bookContext, musicDescriptionAnalysis, options } = input;
  const lyricInstruction = options.includeLyrics && musicDescriptionAnalysis.lyricSeed
    ? `include original lyrics inspired by: ${musicDescriptionAnalysis.lyricSeed}`
    : "instrumental, no lyrics";

  const basePrompt = [
    `Create a ${options.durationSeconds}-second AI-generated music clip.`,
    `Book context: ${bookContext.title} by ${bookContext.author}, ${bookContext.inferredGenre}, ${bookContext.inferredPeriod}.`,
    `Overall mood: ${bookContext.inferredMood.join(", ")} with ${options.bookMoodWeight} book mood influence.`,
    `Music direction: ${musicDescriptionAnalysis.tempo} tempo, ${musicDescriptionAnalysis.instruments.join(", ")}, ${musicDescriptionAnalysis.mood.join(", ")} mood, ${musicDescriptionAnalysis.vocalStyle}.`,
    `Scene context: ${musicDescriptionAnalysis.sceneContext.join(", ")}.`,
    `Lyrics: ${lyricInstruction}.`,
    `Adjustments: ${options.adjustments.length > 0 ? options.adjustments.join(", ") : "none"}.`,
    "Do not imitate a specific living artist, band, or copyrighted recording."
  ].join(" ");

  return rewriteArtistImitation(basePrompt).rewrittenPrompt;
}
```

- [ ] **Step 4: Run prompt tests**

Run: `npm test -- tests/unit/analysis.test.ts`

Expected: PASS.

- [ ] **Step 5: Commit prompt composition**

```bash
git add src/lib/analysis/buildGenerationPrompt.ts tests/unit/analysis.test.ts
git commit -m "feat: compose music generation prompts"
```

## Task 6: Analysis API Route

**Files:**
- Create: `app/api/analyze/route.ts`
- Modify: `tests/unit/analysis.test.ts`

- [ ] **Step 1: Add route-level behavior test**

Append to `tests/unit/analysis.test.ts`:

```ts
describe("analysis API contract", () => {
  it("produces book context, music analysis, and prompt from valid input", () => {
    const bookContext = analyzeBookContext({
      title: "The Winter Archive",
      author: "Mina Park",
      optionalSummary: "A quiet literary novel about grief and snow."
    });
    const musicDescriptionAnalysis = analyzeMusicDescription(
      "A slow piano song about never forgetting the sea."
    );
    const prompt = buildGenerationPrompt({
      bookContext,
      musicDescriptionAnalysis,
      options: {
        includeLyrics: true,
        durationSeconds: 60,
        adjustments: [],
        bookMoodWeight: "medium"
      }
    });

    expect(prompt).toContain("Create a 60-second AI-generated music clip.");
    expect(musicDescriptionAnalysis.lyricsDetected).toBe(true);
  });
});
```

- [ ] **Step 2: Run tests**

Run: `npm test -- tests/unit/analysis.test.ts`

Expected: PASS before adding the route, confirming the service layer is ready.

- [ ] **Step 3: Implement analysis route**

Create `app/api/analyze/route.ts`:

```ts
import { NextResponse } from "next/server";
import { z } from "zod";
import { analyzeBookContext } from "@/lib/analysis/analyzeBookContext";
import { analyzeMusicDescription } from "@/lib/analysis/analyzeMusicDescription";
import { buildGenerationPrompt } from "@/lib/analysis/buildGenerationPrompt";
import { sanitizeExcerpt } from "@/lib/safety/sanitizeExcerpt";

const AnalyzeRequestSchema = z.object({
  title: z.string().min(1),
  author: z.string().min(1),
  optionalSummary: z.string().default(""),
  excerpt: z.string().min(1),
  includeLyrics: z.boolean().default(false),
  durationSeconds: z.union([z.literal(30), z.literal(60), z.literal(90)]).default(60),
  adjustments: z.array(z.string()).default([]),
  bookMoodWeight: z.union([z.literal("low"), z.literal("medium"), z.literal("high")]).default("medium")
});

export async function POST(request: Request) {
  try {
    const body = AnalyzeRequestSchema.parse(await request.json());
    const excerpt = sanitizeExcerpt(body.excerpt);
    const bookContext = analyzeBookContext({
      title: body.title,
      author: body.author,
      optionalSummary: body.optionalSummary
    });
    const musicDescriptionAnalysis = analyzeMusicDescription(excerpt);
    const prompt = buildGenerationPrompt({
      bookContext,
      musicDescriptionAnalysis,
      options: {
        includeLyrics: body.includeLyrics,
        durationSeconds: body.durationSeconds,
        adjustments: body.adjustments,
        bookMoodWeight: body.bookMoodWeight
      }
    });

    return NextResponse.json({
      bookContext,
      musicDescriptionAnalysis,
      prompt
    });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Invalid analysis request." },
      { status: 400 }
    );
  }
}
```

- [ ] **Step 4: Build to verify route compiles**

Run: `npm run build`

Expected: Build succeeds after `app/page.tsx` exists in Task 10. If Task 10 has not been completed, defer this build check to Task 10 Step 6.

- [ ] **Step 5: Commit analysis route**

```bash
git add app/api/analyze/route.ts tests/unit/analysis.test.ts
git commit -m "feat: add analysis API route"
```

## Task 7: Music Generation Provider

**Files:**
- Create: `src/lib/generation/MusicProvider.ts`
- Create: `src/lib/generation/mockMusicProvider.ts`
- Create: `src/lib/generation/externalMusicProvider.ts`
- Create: `src/lib/generation/getMusicProvider.ts`
- Test: `tests/unit/generation.test.ts`

- [ ] **Step 1: Write failing provider tests**

Create `tests/unit/generation.test.ts`:

```ts
import { describe, expect, it } from "vitest";
import { getMusicProvider } from "@/lib/generation/getMusicProvider";
import { mockMusicProvider } from "@/lib/generation/mockMusicProvider";

describe("mockMusicProvider", () => {
  it("returns a complete generated track", async () => {
    const track = await mockMusicProvider.generate({
      prompt: "slow piano, melancholic mood",
      sourceBookTitle: "The Winter Archive",
      sourceAuthor: "Mina Park",
      durationSeconds: 60
    });

    expect(track.generationStatus).toBe("complete");
    expect(track.audioUrl).toBe("/audio/mock-track.mp3");
    expect(track.sourceBookTitle).toBe("The Winter Archive");
  });
});

describe("getMusicProvider", () => {
  it("uses mock provider by default", () => {
    expect(getMusicProvider("mock")).toBe(mockMusicProvider);
  });
});
```

- [ ] **Step 2: Run tests to verify failure**

Run: `npm test -- tests/unit/generation.test.ts`

Expected: FAIL because generation modules do not exist.

- [ ] **Step 3: Create provider interface**

Create `src/lib/generation/MusicProvider.ts`:

```ts
import type { GeneratedTrack } from "@/types/litsound";

export type GenerateMusicInput = {
  prompt: string;
  sourceBookTitle: string;
  sourceAuthor: string;
  durationSeconds: 30 | 60 | 90;
};

export type MusicProvider = {
  generate(input: GenerateMusicInput): Promise<GeneratedTrack>;
};
```

- [ ] **Step 4: Create mock provider**

Create `src/lib/generation/mockMusicProvider.ts`:

```ts
import type { MusicProvider } from "@/lib/generation/MusicProvider";

export const mockMusicProvider: MusicProvider = {
  async generate(input) {
    return {
      id: `mock-${Date.now()}`,
      audioUrl: "/audio/mock-track.mp3",
      title: "Generated Reading Theme",
      description: input.prompt,
      durationSeconds: input.durationSeconds,
      generationStatus: "complete",
      createdAt: new Date().toISOString(),
      sourceBookTitle: input.sourceBookTitle,
      sourceAuthor: input.sourceAuthor
    };
  }
};
```

- [ ] **Step 5: Create external provider adapter**

Create `src/lib/generation/externalMusicProvider.ts`:

```ts
import type { MusicProvider } from "@/lib/generation/MusicProvider";

export const externalMusicProvider: MusicProvider = {
  async generate(input) {
    const apiUrl = process.env.MUSIC_PROVIDER_API_URL;
    const apiKey = process.env.MUSIC_PROVIDER_API_KEY;

    if (!apiUrl || !apiKey) {
      throw new Error("External music provider is not configured.");
    }

    const response = await fetch(apiUrl, {
      method: "POST",
      headers: {
        "content-type": "application/json",
        authorization: `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        prompt: input.prompt,
        durationSeconds: input.durationSeconds
      })
    });

    if (!response.ok) {
      throw new Error("Music provider request failed.");
    }

    const data = await response.json() as { id: string; audioUrl: string; title?: string };

    return {
      id: data.id,
      audioUrl: data.audioUrl,
      title: data.title ?? "Generated Reading Theme",
      description: input.prompt,
      durationSeconds: input.durationSeconds,
      generationStatus: "complete",
      createdAt: new Date().toISOString(),
      sourceBookTitle: input.sourceBookTitle,
      sourceAuthor: input.sourceAuthor
    };
  }
};
```

- [ ] **Step 6: Create provider selector**

Create `src/lib/generation/getMusicProvider.ts`:

```ts
import type { MusicProvider } from "@/lib/generation/MusicProvider";
import { externalMusicProvider } from "@/lib/generation/externalMusicProvider";
import { mockMusicProvider } from "@/lib/generation/mockMusicProvider";

export function getMusicProvider(mode = process.env.MUSIC_PROVIDER_MODE ?? "mock"): MusicProvider {
  return mode === "external" ? externalMusicProvider : mockMusicProvider;
}
```

- [ ] **Step 7: Add mock audio asset**

Add a short MP3 file at `public/audio/mock-track.mp3`.

Verification: open `http://127.0.0.1:3000/audio/mock-track.mp3` while the dev server runs and confirm the browser can load the audio.

- [ ] **Step 8: Run generation tests**

Run: `npm test -- tests/unit/generation.test.ts`

Expected: PASS.

- [ ] **Step 9: Commit generation provider**

```bash
git add src/lib/generation public/audio/mock-track.mp3 tests/unit/generation.test.ts
git commit -m "feat: add music generation provider interface"
```

## Task 8: Generation API Route

**Files:**
- Create: `app/api/generate/route.ts`
- Modify: `tests/unit/generation.test.ts`

- [ ] **Step 1: Add request validation test through provider input**

Append to `tests/unit/generation.test.ts`:

```ts
describe("generation provider input", () => {
  it("preserves source metadata in generated tracks", async () => {
    const track = await mockMusicProvider.generate({
      prompt: "instrumental slow piano",
      sourceBookTitle: "Sea Memory",
      sourceAuthor: "J. Han",
      durationSeconds: 30
    });

    expect(track.sourceBookTitle).toBe("Sea Memory");
    expect(track.sourceAuthor).toBe("J. Han");
    expect(track.durationSeconds).toBe(30);
  });
});
```

- [ ] **Step 2: Run generation tests**

Run: `npm test -- tests/unit/generation.test.ts`

Expected: PASS.

- [ ] **Step 3: Implement generation route**

Create `app/api/generate/route.ts`:

```ts
import { NextResponse } from "next/server";
import { z } from "zod";
import { getMusicProvider } from "@/lib/generation/getMusicProvider";
import { rewriteArtistImitation } from "@/lib/safety/rewriteArtistImitation";

const GenerateRequestSchema = z.object({
  prompt: z.string().min(1),
  sourceBookTitle: z.string().min(1),
  sourceAuthor: z.string().min(1),
  durationSeconds: z.union([z.literal(30), z.literal(60), z.literal(90)]).default(60)
});

export async function POST(request: Request) {
  try {
    const body = GenerateRequestSchema.parse(await request.json());
    const safePrompt = rewriteArtistImitation(body.prompt).rewrittenPrompt;
    const provider = getMusicProvider();
    const track = await provider.generate({
      prompt: safePrompt,
      sourceBookTitle: body.sourceBookTitle,
      sourceAuthor: body.sourceAuthor,
      durationSeconds: body.durationSeconds
    });

    return NextResponse.json({ track });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Invalid generation request." },
      { status: 400 }
    );
  }
}
```

- [ ] **Step 4: Commit generation route**

```bash
git add app/api/generate/route.ts tests/unit/generation.test.ts
git commit -m "feat: add generation API route"
```

## Task 9: Mobile UI Components

**Files:**
- Create: `src/components/BookInputForm.tsx`
- Create: `src/components/AnalysisReview.tsx`
- Create: `src/components/GenerationOptions.tsx`
- Create: `src/components/TrackPlayer.tsx`
- Create: `src/components/RegenerationControls.tsx`
- Mobile rule: controls must fit without horizontal scroll at 360px width.

- [ ] **Step 1: Create book input form**

Create `src/components/BookInputForm.tsx`:

```tsx
"use client";

type BookInputFormProps = {
  values: {
    title: string;
    author: string;
    optionalSummary: string;
    excerpt: string;
  };
  onChange: (values: BookInputFormProps["values"]) => void;
  onAnalyze: () => void;
  isAnalyzing: boolean;
};

export function BookInputForm({ values, onChange, onAnalyze, isAnalyzing }: BookInputFormProps) {
  return (
    <section className="grid gap-4">
      <label className="grid gap-2">
        <span className="text-sm font-semibold">책 제목</span>
        <input
          className="rounded border border-stone-300 px-3 py-2"
          value={values.title}
          onChange={(event) => onChange({ ...values, title: event.target.value })}
        />
      </label>
      <label className="grid gap-2">
        <span className="text-sm font-semibold">작가</span>
        <input
          className="rounded border border-stone-300 px-3 py-2"
          value={values.author}
          onChange={(event) => onChange({ ...values, author: event.target.value })}
        />
      </label>
      <label className="grid gap-2">
        <span className="text-sm font-semibold">줄거리 또는 장면 설명</span>
        <textarea
          className="min-h-20 rounded border border-stone-300 px-3 py-2"
          value={values.optionalSummary}
          onChange={(event) => onChange({ ...values, optionalSummary: event.target.value })}
        />
      </label>
      <label className="grid gap-2">
        <span className="text-sm font-semibold">책 속 음악 묘사</span>
        <textarea
          className="min-h-32 rounded border border-stone-300 px-3 py-2"
          maxLength={1500}
          value={values.excerpt}
          onChange={(event) => onChange({ ...values, excerpt: event.target.value })}
        />
        <span className="text-xs text-stone-600">{values.excerpt.length}/1500</span>
      </label>
      <button
        className="rounded bg-stone-950 px-4 py-3 font-semibold text-white disabled:opacity-50"
        disabled={isAnalyzing || !values.title || !values.author || !values.excerpt}
        onClick={onAnalyze}
      >
        {isAnalyzing ? "분석 중" : "분석하기"}
      </button>
    </section>
  );
}
```

- [ ] **Step 2: Create analysis review component**

Create `src/components/AnalysisReview.tsx`:

```tsx
"use client";

import type { BookContext, MusicDescriptionAnalysis } from "@/types/litsound";

type AnalysisReviewProps = {
  bookContext: BookContext;
  musicAnalysis: MusicDescriptionAnalysis;
  prompt: string;
};

export function AnalysisReview({ bookContext, musicAnalysis, prompt }: AnalysisReviewProps) {
  return (
    <section className="grid gap-4 rounded border border-stone-300 bg-white p-4">
      <h2 className="text-lg font-bold">분석 결과</h2>
      <div className="grid gap-2 text-sm">
        <p><strong>작품 분위기:</strong> {bookContext.inferredMood.join(", ")}</p>
        <p><strong>장르:</strong> {bookContext.inferredGenre}</p>
        <p><strong>음악 스타일:</strong> {musicAnalysis.styleKeywords.join(", ")}</p>
        <p><strong>악기:</strong> {musicAnalysis.instruments.join(", ")}</p>
        <p><strong>가사 감지:</strong> {musicAnalysis.lyricsDetected ? "있음" : "없음"}</p>
      </div>
      <details className="text-sm">
        <summary className="cursor-pointer font-semibold">생성 프롬프트 보기</summary>
        <p className="mt-2 whitespace-pre-wrap rounded bg-stone-100 p-3">{prompt}</p>
      </details>
    </section>
  );
}
```

- [ ] **Step 3: Create generation options component**

Create `src/components/GenerationOptions.tsx`:

```tsx
"use client";

import type { GenerationOptions as GenerationOptionsType } from "@/types/litsound";

type GenerationOptionsProps = {
  options: GenerationOptionsType;
  onChange: (options: GenerationOptionsType) => void;
};

export function GenerationOptions({ options, onChange }: GenerationOptionsProps) {
  return (
    <section className="grid gap-4 rounded border border-stone-300 bg-white p-4">
      <h2 className="text-lg font-bold">생성 옵션</h2>
      <label className="flex items-center gap-2">
        <input
          type="checkbox"
          checked={options.includeLyrics}
          onChange={(event) => onChange({ ...options, includeLyrics: event.target.checked })}
        />
        <span>가사 포함</span>
      </label>
      <label className="grid gap-2">
        <span className="text-sm font-semibold">길이</span>
        <select
          className="rounded border border-stone-300 px-3 py-2"
          value={options.durationSeconds}
          onChange={(event) => onChange({ ...options, durationSeconds: Number(event.target.value) as 30 | 60 | 90 })}
        >
          <option value={30}>30초</option>
          <option value={60}>60초</option>
          <option value={90}>90초</option>
        </select>
      </label>
      <label className="grid gap-2">
        <span className="text-sm font-semibold">책 분위기 반영 강도</span>
        <select
          className="rounded border border-stone-300 px-3 py-2"
          value={options.bookMoodWeight}
          onChange={(event) => onChange({ ...options, bookMoodWeight: event.target.value as "low" | "medium" | "high" })}
        >
          <option value="low">낮게</option>
          <option value="medium">보통</option>
          <option value="high">높게</option>
        </select>
      </label>
    </section>
  );
}
```

- [ ] **Step 4: Create track player**

Create `src/components/TrackPlayer.tsx`:

```tsx
"use client";

import type { GeneratedTrack } from "@/types/litsound";

export function TrackPlayer({ track }: { track: GeneratedTrack }) {
  return (
    <section className="grid gap-4 rounded border border-stone-300 bg-white p-4">
      <h2 className="text-lg font-bold">{track.title}</h2>
      <audio className="w-full" controls src={track.audioUrl} />
      <div className="grid gap-1 text-sm text-stone-700">
        <p>책: {track.sourceBookTitle}</p>
        <p>작가: {track.sourceAuthor}</p>
        <p>길이: {track.durationSeconds}초</p>
        <p>AI 생성 음악입니다.</p>
      </div>
    </section>
  );
}
```

- [ ] **Step 5: Create regeneration controls**

Create `src/components/RegenerationControls.tsx`:

```tsx
"use client";

const QUICK_ADJUSTMENTS = ["더 어둡게", "더 밝게", "더 느리게", "더 빠르게", "보컬 제거", "현악기 중심"];

type RegenerationControlsProps = {
  selected: string[];
  onChange: (selected: string[]) => void;
  onRegenerate: () => void;
  disabled: boolean;
};

export function RegenerationControls({ selected, onChange, onRegenerate, disabled }: RegenerationControlsProps) {
  return (
    <section className="grid gap-3 rounded border border-stone-300 bg-white p-4">
      <h2 className="text-lg font-bold">다시 생성</h2>
      <div className="flex flex-wrap gap-2">
        {QUICK_ADJUSTMENTS.map((adjustment) => {
          const active = selected.includes(adjustment);
          return (
            <button
              className={active ? "rounded bg-stone-950 px-3 py-2 text-sm text-white" : "rounded border border-stone-300 px-3 py-2 text-sm"}
              key={adjustment}
              onClick={() => onChange(active ? selected.filter((item) => item !== adjustment) : [...selected, adjustment])}
            >
              {adjustment}
            </button>
          );
        })}
      </div>
      <button
        className="rounded bg-stone-950 px-4 py-3 font-semibold text-white disabled:opacity-50"
        disabled={disabled}
        onClick={onRegenerate}
      >
        선택한 방향으로 다시 생성
      </button>
    </section>
  );
}
```

- [ ] **Step 6: Commit UI components**

```bash
git add src/components
git commit -m "feat: add LitSound UI components"
```

## Task 10: Main Workflow Page

**Files:**
- Create: `app/page.tsx`
- Test: `tests/e2e/litsound-flow.spec.ts`

- [ ] **Step 1: Create main page**

Create `app/page.tsx`:

```tsx
"use client";

import { useState } from "react";
import { AnalysisReview } from "@/components/AnalysisReview";
import { BookInputForm } from "@/components/BookInputForm";
import { GenerationOptions } from "@/components/GenerationOptions";
import { RegenerationControls } from "@/components/RegenerationControls";
import { TrackPlayer } from "@/components/TrackPlayer";
import type { BookContext, GeneratedTrack, GenerationOptions as GenerationOptionsType, MusicDescriptionAnalysis } from "@/types/litsound";

type AnalysisState = {
  bookContext: BookContext;
  musicDescriptionAnalysis: MusicDescriptionAnalysis;
  prompt: string;
};

export default function HomePage() {
  const [formValues, setFormValues] = useState({
    title: "",
    author: "",
    optionalSummary: "",
    excerpt: ""
  });
  const [options, setOptions] = useState<GenerationOptionsType>({
    includeLyrics: false,
    durationSeconds: 60,
    adjustments: [],
    bookMoodWeight: "medium"
  });
  const [analysis, setAnalysis] = useState<AnalysisState | null>(null);
  const [track, setTrack] = useState<GeneratedTrack | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState("");

  async function analyze() {
    setError("");
    setIsAnalyzing(true);
    const response = await fetch("/api/analyze", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ ...formValues, ...options })
    });
    const data = await response.json();
    setIsAnalyzing(false);
    if (!response.ok) {
      setError(data.error ?? "분석에 실패했습니다.");
      return;
    }
    setAnalysis(data);
    setTrack(null);
  }

  async function generate(nextAdjustments = options.adjustments) {
    if (!analysis) return;
    setError("");
    setIsGenerating(true);
    const response = await fetch("/api/generate", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        prompt: nextAdjustments.length > 0 ? `${analysis.prompt} Adjustments: ${nextAdjustments.join(", ")}.` : analysis.prompt,
        sourceBookTitle: analysis.bookContext.title,
        sourceAuthor: analysis.bookContext.author,
        durationSeconds: options.durationSeconds
      })
    });
    const data = await response.json();
    setIsGenerating(false);
    if (!response.ok) {
      setError(data.error ?? "생성에 실패했습니다.");
      return;
    }
    setTrack(data.track);
  }

  return (
    <main className="mx-auto grid max-w-5xl gap-6 px-5 py-8">
      <header className="grid gap-2">
        <p className="text-sm font-semibold uppercase tracking-wide text-stone-600">LitSound</p>
        <h1 className="text-3xl font-bold">책 속 음악을 실제로 들어보세요</h1>
        <p className="max-w-2xl text-stone-700">
          책 제목, 작가, 음악 묘사 문장을 입력하면 작품의 분위기와 음악 단서를 분석해 재생 가능한 트랙으로 만듭니다.
        </p>
      </header>

      <div className="grid gap-4">
        <BookInputForm values={formValues} onChange={setFormValues} onAnalyze={analyze} isAnalyzing={isAnalyzing} />
        <GenerationOptions options={options} onChange={setOptions} />
      </div>

      {error ? <p className="rounded border border-red-300 bg-red-50 p-3 text-red-700">{error}</p> : null}

      {analysis ? (
        <AnalysisReview
          bookContext={analysis.bookContext}
          musicAnalysis={analysis.musicDescriptionAnalysis}
          prompt={analysis.prompt}
        />
      ) : null}

      {analysis ? (
        <button
          className="rounded bg-stone-950 px-4 py-3 font-semibold text-white disabled:opacity-50"
          disabled={isGenerating}
          onClick={() => generate()}
        >
          {isGenerating ? "음악 생성 중" : "음악 생성하기"}
        </button>
      ) : null}

      {track ? <TrackPlayer track={track} /> : null}

      {analysis && track ? (
        <RegenerationControls
          selected={options.adjustments}
          onChange={(adjustments) => setOptions({ ...options, adjustments })}
          onRegenerate={() => generate(options.adjustments)}
          disabled={isGenerating}
        />
      ) : null}
    </main>
  );
}
```

- [ ] **Step 2: Add browser flow test**

Create `tests/e2e/litsound-flow.spec.ts`:

```ts
import { expect, test } from "@playwright/test";

test("user can analyze a book excerpt and generate a playable track", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/");
  await page.getByLabel("책 제목").fill("The Winter Archive");
  await page.getByLabel("작가").fill("Mina Park");
  await page.getByLabel("줄거리 또는 장면 설명").fill("A quiet literary novel about grief, snow, and memory.");
  await page.getByLabel("책 속 음악 묘사").fill("A slow piano song about never forgetting the sea.");

  await page.getByRole("button", { name: "분석하기" }).click();
  await expect(page.getByText("분석 결과")).toBeVisible();
  await expect(page.getByText("piano")).toBeVisible();

  await page.getByRole("button", { name: "음악 생성하기" }).click();
  await expect(page.getByText("Generated Reading Theme")).toBeVisible();
  await expect(page.locator("audio")).toHaveAttribute("src", "/audio/mock-track.mp3");
  await expect(page.locator("body")).not.toHaveJSProperty("scrollWidth", 391);
});
```

- [ ] **Step 3: Run unit tests**

Run: `npm test`

Expected: PASS.

- [ ] **Step 4: Run build**

Run: `npm run build`

Expected: PASS.

- [ ] **Step 5: Run browser test**

Run: `npm run e2e`

Expected: PASS in Chromium.

- [ ] **Step 6: Commit main workflow**

```bash
git add app/page.tsx tests/e2e/litsound-flow.spec.ts
git commit -m "feat: build LitSound MVP workflow"
```

## Task 11: Error, Loading, and Empty States

**Files:**
- Modify: `app/page.tsx`
- Modify: `src/components/AnalysisReview.tsx`
- Modify: `tests/e2e/litsound-flow.spec.ts`

- [ ] **Step 1: Add e2e test for long excerpt validation**

Append to `tests/e2e/litsound-flow.spec.ts`:

```ts
test("user sees a clear error for oversized excerpts", async ({ page }) => {
  await page.goto("/");
  await page.getByLabel("책 제목").fill("Long Book");
  await page.getByLabel("작가").fill("Long Author");
  await page.getByLabel("책 속 음악 묘사").fill("a".repeat(1500));
  await page.evaluate(() => {
    const textarea = document.querySelector("textarea[maxlength='1500']") as HTMLTextAreaElement;
    textarea.value = `${textarea.value}a`;
    textarea.dispatchEvent(new Event("input", { bubbles: true }));
  });

  await page.getByRole("button", { name: "분석하기" }).click();
  await expect(page.getByText("Excerpt must be 1500 characters or fewer.")).toBeVisible();
});
```

- [ ] **Step 2: Run e2e test to verify failure**

Run: `npm run e2e`

Expected: FAIL if the UI blocks the extra character before API validation. Replace the test with direct route testing if the browser cannot exceed `maxLength`.

- [ ] **Step 3: Add route-level oversized excerpt test**

Replace the oversized e2e test with this test when browser `maxLength` prevents invalid input:

```ts
test("analysis API rejects oversized excerpts", async ({ request }) => {
  const response = await request.post("/api/analyze", {
    data: {
      title: "Long Book",
      author: "Long Author",
      optionalSummary: "",
      excerpt: "a".repeat(1501),
      includeLyrics: false,
      durationSeconds: 60,
      adjustments: [],
      bookMoodWeight: "medium"
    }
  });

  expect(response.status()).toBe(400);
  const body = await response.json();
  expect(body.error).toBe("Excerpt must be 1500 characters or fewer.");
});
```

- [ ] **Step 4: Add visible uncertainty text**

Modify `src/components/AnalysisReview.tsx` so confidence is shown:

```tsx
<p><strong>분석 신뢰도:</strong> 작품 {Math.round(bookContext.confidence * 100)}%, 음악 {Math.round(musicAnalysis.confidence * 100)}%</p>
```

Place the line inside the existing `<div className="grid gap-2 text-sm">`.

- [ ] **Step 5: Run verification**

Run: `npm test && npm run build && npm run e2e`

Expected: PASS.

- [ ] **Step 6: Commit state handling**

```bash
git add app/page.tsx src/components/AnalysisReview.tsx tests/e2e/litsound-flow.spec.ts
git commit -m "feat: improve LitSound states and validation"
```

## Task 12: PRD Traceability Review

**Files:**
- Create: `docs/prd-traceability.md`

- [ ] **Step 1: Create traceability document**

Create `docs/prd-traceability.md`:

```md
# LitSound MVP PRD Traceability

## Implemented In MVP

- Book title and author input: `src/components/BookInputForm.tsx`
- Optional summary or scene input: `src/components/BookInputForm.tsx`
- Music-description excerpt input: `src/components/BookInputForm.tsx`
- Book mood analysis: `src/lib/analysis/analyzeBookContext.ts`
- Music style and lyric separation: `src/lib/analysis/analyzeMusicDescription.ts`
- Prompt composition: `src/lib/analysis/buildGenerationPrompt.ts`
- Music generation request: `app/api/generate/route.ts`
- Audio playback: `src/components/TrackPlayer.tsx`
- Regeneration direction controls: `src/components/RegenerationControls.tsx`
- Excerpt-length safety: `src/lib/safety/sanitizeExcerpt.ts`
- Artist-imitation rewrite: `src/lib/safety/rewriteArtistImitation.ts`

## Deferred Beyond MVP

- User login and persistent library
- Export or download controls
- Publisher-facing campaign tools
- Social sharing and community features
- Multiple generated candidates per request
- Real music-provider production contract selection
```

- [ ] **Step 2: Run full verification**

Run: `npm test && npm run build && npm run e2e`

Expected: PASS.

- [ ] **Step 3: Commit traceability**

```bash
git add docs/prd-traceability.md
git commit -m "docs: add PRD traceability review"
```

## Task 13: Manual Review Checkpoint

**Files:**
- Review: `app/page.tsx`
- Review: `docs/book-music-generation-prd.md`
- Review: `docs/prd-traceability.md`

- [ ] **Step 1: Start local app**

Run: `npm run dev`

Expected: Next.js dev server starts at `http://127.0.0.1:3000`.

- [ ] **Step 2: Manual happy-path review**

Open `http://127.0.0.1:3000` and use:

```txt
책 제목: The Winter Archive
작가: Mina Park
줄거리 또는 장면 설명: A quiet literary novel about grief, snow, and memory.
책 속 음악 묘사: A slow piano song about never forgetting the sea.
```

Expected:

- The analysis result appears.
- The style includes `slow` and `piano`.
- The prompt can be expanded.
- The generation button returns a track.
- The audio player appears and references `/audio/mock-track.mp3`.
- Regeneration controls appear after a track is generated.

- [ ] **Step 3: Manual safety review**

Use:

```txt
책 제목: Pop Novel
작가: Example Writer
책 속 음악 묘사: Make this sound like Taylor Swift with bright pop vocals.
```

Expected:

- Generated prompt does not include `Taylor Swift`.
- Prompt keeps generic style traits such as `bright pop vocals`.

- [ ] **Step 4: Stop dev server**

Stop the running dev server with `Ctrl+C`.

- [ ] **Step 5: Final verification before handoff**

Run: `npm test && npm run build && npm run e2e`

Expected: PASS.

## Execution Order

1. Task 1: Project Scaffold
2. Task 2: Domain Types
3. Task 3: Safety Guards
4. Task 4: Analysis Services
5. Task 5: Prompt Composition
6. Task 6: Analysis API Route
7. Task 7: Music Generation Provider
8. Task 8: Generation API Route
9. Task 9: UI Components
10. Task 10: Main Workflow Page
11. Task 11: Error, Loading, and Empty States
12. Task 12: PRD Traceability Review
13. Task 13: Manual Review Checkpoint

## Review Gates

- After Task 5: review analysis output and generation prompt before UI work.
- After Task 8: review API response shapes before wiring the page.
- After Task 10: review the end-to-end user flow in the browser.
- After Task 13: review mobile screenshots at 390x844 and 360x800, then decide whether to connect a production music provider or keep the MVP in mock mode for user testing.
