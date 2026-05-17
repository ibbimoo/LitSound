"use client";

import type { GeneratedTrack } from "@/types/litsound";

export function TrackPlayer({ track }: { track: GeneratedTrack }) {
  return (
    <section className="grid gap-4 rounded-xl border border-stone-300 bg-white p-4 shadow-sm">
      <h2 className="break-words text-lg font-bold">{track.title}</h2>
      <audio className="w-full" controls src={track.audioUrl} />
      <div className="grid gap-1 text-sm leading-6 text-stone-700">
        <p>책: {track.sourceBookTitle}</p>
        <p>작가: {track.sourceAuthor}</p>
        <p>길이: {track.durationSeconds}초</p>
        <p>AI 생성 음악입니다.</p>
      </div>
    </section>
  );
}
