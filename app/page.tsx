"use client";

import { useState } from "react";
import { AnalysisReview } from "@/components/AnalysisReview";
import { BookInputForm } from "@/components/BookInputForm";
import { GenerationOptions } from "@/components/GenerationOptions";
import { RegenerationControls } from "@/components/RegenerationControls";
import { TrackPlayer } from "@/components/TrackPlayer";
import type {
  BookContext,
  GeneratedTrack,
  GenerationOptions as GenerationOptionsType,
  MusicDescriptionAnalysis
} from "@/types/litsound";

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
        prompt: nextAdjustments.length > 0
          ? `${analysis.prompt} Adjustments: ${nextAdjustments.join(", ")}.`
          : analysis.prompt,
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
    <main className="mx-auto grid min-h-screen w-full max-w-md gap-5 px-4 pb-8 pt-5">
      <header className="grid gap-2">
        <p className="text-xs font-semibold uppercase tracking-wide text-stone-600">LitSound</p>
        <h1 className="text-2xl font-bold leading-tight">책 속 음악을 실제로 들어보세요</h1>
        <p className="text-sm leading-6 text-stone-700">
          책 제목, 작가, 음악 묘사 문장을 입력하면 작품의 분위기와 음악 단서를 분석해 재생 가능한 트랙으로 만듭니다.
        </p>
      </header>

      <BookInputForm values={formValues} onChange={setFormValues} onAnalyze={analyze} isAnalyzing={isAnalyzing} />
      <GenerationOptions options={options} onChange={setOptions} />

      {error ? <p className="rounded-lg border border-red-300 bg-red-50 p-3 text-sm text-red-700">{error}</p> : null}

      {analysis ? (
        <AnalysisReview
          bookContext={analysis.bookContext}
          musicAnalysis={analysis.musicDescriptionAnalysis}
          prompt={analysis.prompt}
        />
      ) : null}

      {analysis ? (
        <button
          className="min-h-12 w-full rounded-lg bg-stone-950 px-4 py-3 font-semibold text-white disabled:opacity-50"
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
