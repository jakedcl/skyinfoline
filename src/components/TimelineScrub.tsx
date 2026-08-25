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
  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-3 px-6">
      <div className="flex items-baseline justify-between gap-4">
        <label
          htmlFor="skyline-year"
          className="text-xs tracking-[0.22em] text-[var(--ink-muted)] uppercase"
        >
          Skyline year
        </label>
        <span className="font-[family-name:var(--font-display)] text-2xl tabular-nums text-[var(--ink)]">
          {value}
        </span>
      </div>

      <input
        id="skyline-year"
        type="range"
        min={min}
        max={max}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
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
