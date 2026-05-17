import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { AnalysisReview } from "@/components/AnalysisReview";
import { BookInputForm } from "@/components/BookInputForm";
import { GenerationOptions } from "@/components/GenerationOptions";
import { RegenerationControls } from "@/components/RegenerationControls";
import { TrackPlayer } from "@/components/TrackPlayer";

describe("mobile UI components", () => {
  it("renders the book input form with mobile-friendly fields", () => {
    render(
      <BookInputForm
        values={{ title: "", author: "", optionalSummary: "", excerpt: "" }}
        onChange={vi.fn()}
        onAnalyze={vi.fn()}
        isAnalyzing={false}
      />
    );

    expect(screen.getByLabelText("책 제목")).toBeTruthy();
    expect(screen.getByLabelText("책 속 음악 묘사")).toBeTruthy();
    expect(screen.getByRole("button", { name: "분석하기" })).toBeTruthy();
  });

  it("renders analysis, options, player, and regeneration controls", () => {
    render(
      <>
        <AnalysisReview
          bookContext={{
            title: "The Winter Archive",
            author: "Mina Park",
            optionalSummary: "",
            inferredGenre: "literary fiction",
            inferredMood: ["melancholic"],
            inferredPeriod: "contemporary",
            confidence: 0.76
          }}
          musicAnalysis={{
            rawText: "A slow piano song.",
            styleKeywords: ["slow", "soft vocal"],
            instruments: ["piano"],
            tempo: "slow",
            mood: ["reflective"],
            vocalStyle: "soft vocal",
            lyricsDetected: true,
            lyricSeed: "the sea",
            sceneContext: ["sea memory"],
            confidence: 0.8
          }}
          prompt="Create a slow piano clip."
        />
        <GenerationOptions
          options={{ includeLyrics: false, durationSeconds: 60, adjustments: [], bookMoodWeight: "medium" }}
          onChange={vi.fn()}
        />
        <TrackPlayer
          track={{
            id: "track-1",
            audioUrl: "/audio/mock-track.wav",
            title: "Generated Reading Theme",
            description: "slow piano",
            durationSeconds: 60,
            generationStatus: "complete",
            createdAt: "2026-05-17T00:00:00.000Z",
            sourceBookTitle: "The Winter Archive",
            sourceAuthor: "Mina Park"
          }}
        />
        <RegenerationControls selected={[]} onChange={vi.fn()} onRegenerate={vi.fn()} disabled={false} />
      </>
    );

    expect(screen.getByText("분석 결과")).toBeTruthy();
    expect(screen.getByText("생성 옵션")).toBeTruthy();
    expect(screen.getByText("Generated Reading Theme")).toBeTruthy();
    expect(screen.getByText("다시 생성")).toBeTruthy();
  });
});
