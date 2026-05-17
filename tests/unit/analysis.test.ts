import { describe, expect, it } from "vitest";
import { analyzeBookContext } from "@/lib/analysis/analyzeBookContext";
import { analyzeMusicDescription } from "@/lib/analysis/analyzeMusicDescription";
import { buildGenerationPrompt } from "@/lib/analysis/buildGenerationPrompt";
import { POST as analyzePost } from "../../app/api/analyze/route";
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

describe("analysis API route", () => {
  it("returns book context, music analysis, and prompt from valid input", async () => {
    const response = await analyzePost(
      new Request("http://localhost/api/analyze", {
        method: "POST",
        body: JSON.stringify({
          title: "The Winter Archive",
          author: "Mina Park",
          optionalSummary: "A quiet literary novel about grief and snow.",
          excerpt: "A slow piano song about never forgetting the sea.",
          includeLyrics: true,
          durationSeconds: 60,
          adjustments: [],
          bookMoodWeight: "medium"
        })
      })
    );
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.bookContext.inferredGenre).toBe("literary fiction");
    expect(body.musicDescriptionAnalysis.instruments).toContain("piano");
    expect(body.prompt).toContain("Create a 60-second AI-generated music clip.");
  });
});
