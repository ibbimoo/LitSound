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
    <section className="grid gap-3 rounded-xl border border-stone-300 bg-white p-4 shadow-sm">
      <h2 className="text-lg font-bold">다시 생성</h2>
      <div className="grid grid-cols-2 gap-2">
        {QUICK_ADJUSTMENTS.map((adjustment) => {
          const active = selected.includes(adjustment);
          return (
            <button
              className={active
                ? "min-h-11 rounded-lg bg-stone-950 px-2 py-2 text-sm text-white"
                : "min-h-11 rounded-lg border border-stone-300 bg-white px-2 py-2 text-sm"}
              key={adjustment}
              onClick={() => onChange(active ? selected.filter((item) => item !== adjustment) : [...selected, adjustment])}
            >
              {adjustment}
            </button>
          );
        })}
      </div>
      <button
        className="min-h-12 w-full rounded-lg bg-stone-950 px-4 py-3 font-semibold text-white disabled:opacity-50"
        disabled={disabled}
        onClick={onRegenerate}
      >
        선택한 방향으로 다시 생성
      </button>
    </section>
  );
}
