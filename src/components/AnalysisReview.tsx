"use client";

import type { BookContext, MusicDescriptionAnalysis } from "@/types/litsound";

type AnalysisReviewProps = {
  bookContext: BookContext;
  musicAnalysis: MusicDescriptionAnalysis;
  prompt: string;
};

export function AnalysisReview({ bookContext, musicAnalysis, prompt }: AnalysisReviewProps) {
  return (
    <section className="grid gap-4 rounded-xl border border-stone-300 bg-white p-4 shadow-sm">
      <h2 className="text-lg font-bold">분석 결과</h2>
      <div className="grid gap-2 text-sm leading-6">
        <p><strong>작품 분위기:</strong> {bookContext.inferredMood.join(", ")}</p>
        <p><strong>장르:</strong> {bookContext.inferredGenre}</p>
        <p><strong>음악 스타일:</strong> {musicAnalysis.styleKeywords.join(", ")}</p>
        <p><strong>악기:</strong> {musicAnalysis.instruments.join(", ")}</p>
        <p><strong>가사 감지:</strong> {musicAnalysis.lyricsDetected ? "있음" : "없음"}</p>
        <p><strong>분석 신뢰도:</strong> 작품 {Math.round(bookContext.confidence * 100)}%, 음악 {Math.round(musicAnalysis.confidence * 100)}%</p>
      </div>
      <details className="text-sm">
        <summary className="cursor-pointer font-semibold">생성 프롬프트 보기</summary>
        <p className="mt-2 max-h-48 overflow-auto whitespace-pre-wrap break-words rounded-lg bg-stone-100 p-3 text-xs leading-5">
          {prompt}
        </p>
      </details>
    </section>
  );
}
