"use client";

import type { GenerationOptions as GenerationOptionsType } from "@/types/litsound";

type GenerationOptionsProps = {
  options: GenerationOptionsType;
  onChange: (options: GenerationOptionsType) => void;
};

export function GenerationOptions({ options, onChange }: GenerationOptionsProps) {
  return (
    <section className="grid gap-4 rounded-xl border border-stone-300 bg-white p-4 shadow-sm">
      <h2 className="text-lg font-bold">생성 옵션</h2>
      <label className="flex min-h-11 items-center gap-3">
        <input
          type="checkbox"
          checked={options.includeLyrics}
          onChange={(event) => onChange({ ...options, includeLyrics: event.target.checked })}
        />
        <span>가사 포함</span>
      </label>
      <label className="grid gap-2" htmlFor="duration">
        <span className="text-sm font-semibold">길이</span>
        <select
          id="duration"
          className="min-h-11 w-full rounded-lg border border-stone-300 bg-white px-3 py-2"
          value={options.durationSeconds}
          onChange={(event) => onChange({ ...options, durationSeconds: Number(event.target.value) as 30 | 60 | 90 })}
        >
          <option value={30}>30초</option>
          <option value={60}>60초</option>
          <option value={90}>90초</option>
        </select>
      </label>
      <label className="grid gap-2" htmlFor="mood-weight">
        <span className="text-sm font-semibold">책 분위기 반영 강도</span>
        <select
          id="mood-weight"
          className="min-h-11 w-full rounded-lg border border-stone-300 bg-white px-3 py-2"
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
