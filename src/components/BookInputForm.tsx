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
      <label className="grid gap-2" htmlFor="book-title">
        <span className="text-sm font-semibold">책 제목</span>
        <input
          id="book-title"
          className="min-h-12 w-full rounded-lg border border-stone-300 bg-white px-3 py-2"
          value={values.title}
          onChange={(event) => onChange({ ...values, title: event.target.value })}
        />
      </label>
      <label className="grid gap-2" htmlFor="book-author">
        <span className="text-sm font-semibold">작가</span>
        <input
          id="book-author"
          className="min-h-12 w-full rounded-lg border border-stone-300 bg-white px-3 py-2"
          value={values.author}
          onChange={(event) => onChange({ ...values, author: event.target.value })}
        />
      </label>
      <label className="grid gap-2" htmlFor="book-summary">
        <span className="text-sm font-semibold">줄거리 또는 장면 설명</span>
        <textarea
          id="book-summary"
          className="min-h-24 w-full rounded-lg border border-stone-300 bg-white px-3 py-2"
          value={values.optionalSummary}
          onChange={(event) => onChange({ ...values, optionalSummary: event.target.value })}
        />
      </label>
      <div className="grid gap-2">
        <label className="text-sm font-semibold" htmlFor="music-excerpt">책 속 음악 묘사</label>
        <textarea
          id="music-excerpt"
          className="min-h-36 w-full rounded-lg border border-stone-300 bg-white px-3 py-2"
          maxLength={1500}
          value={values.excerpt}
          onChange={(event) => onChange({ ...values, excerpt: event.target.value })}
        />
        <span className="text-right text-xs text-stone-600">{values.excerpt.length}/1500</span>
      </div>
      <button
        className="min-h-12 w-full rounded-lg bg-stone-950 px-4 py-3 font-semibold text-white disabled:opacity-50"
        disabled={isAnalyzing || !values.title || !values.author || !values.excerpt}
        onClick={onAnalyze}
      >
        {isAnalyzing ? "분석 중" : "분석하기"}
      </button>
    </section>
  );
}
