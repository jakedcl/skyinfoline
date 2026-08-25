"use client";

type TimelineScrubProps = {
  min: number;
  max: number;
  value: number;
  onChange: (year: number) => void;
};

export function TimelineScrub({
  min,
  max,
  value,
  onChange,
}: TimelineScrubProps) {
  const nudge = (delta: number) => {
    onChange(Math.min(max, Math.max(min, value + delta)));
  };

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-3 px-6">
      <div className="flex items-baseline justify-between gap-4">
        <label
          htmlFor="skyline-year"
          className="text-xs tracking-[0.22em] text-[var(--ink-muted)] uppercase"
        >
          Skyline year
        </label>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => nudge(-10)}
            className="border border-[var(--line)] px-2 py-1 text-xs text-[var(--ink-muted)] transition-colors hover:border-[var(--accent)] hover:text-[var(--accent)]"
            aria-label="Go back 10 years"
          >
            −10
          </button>
          <span className="min-w-[4.5rem] text-center text-2xl tabular-nums text-[var(--ink)]">
            {value}
          </span>
          <button
            type="button"
            onClick={() => nudge(10)}
            className="border border-[var(--line)] px-2 py-1 text-xs text-[var(--ink-muted)] transition-colors hover:border-[var(--accent)] hover:text-[var(--accent)]"
            aria-label="Go forward 10 years"
          >
            +10
          </button>
        </div>
      </div>

      <input
        id="skyline-year"
        type="range"
        min={min}
        max={max}
        step={1}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        onInput={(e) => onChange(Number((e.target as HTMLInputElement).value))}
        className="year-range w-full"
        aria-valuemin={min}
        aria-valuemax={max}
        aria-valuenow={value}
        aria-label="Filter skyline by completion year"
      />

      <div className="flex justify-between text-[11px] tracking-wider text-[var(--ink-muted)] uppercase">
        <span>{min}</span>
        <span>Towers completed by this year stay lit</span>
        <span>{max}</span>
      </div>
    </div>
  );
}
