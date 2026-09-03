"use client";

import {
  eraById,
  eraForYear,
  eraScrubBounds,
  SKYLINE_ERAS,
} from "@/lib/eras";

type CinematicTimelineProps = {
  min: number;
  max: number;
  value: number;
  eraFilterId?: string | null;
  onChange: (year: number) => void;
  onEraSelect: (eraId: string | null) => void;
};

export function CinematicTimeline({
  min,
  max,
  value,
  eraFilterId = null,
  onChange,
  onEraSelect,
}: CinematicTimelineProps) {
  const eraFilter = eraById(eraFilterId);
  const scrubBounds = eraFilter
    ? eraScrubBounds(eraFilter, min, max)
    : { min, max };
  const displayEra = eraFilter ?? eraForYear(value);

  const visibleEras = SKYLINE_ERAS.filter(
    (e) => e.endYear >= min && e.startYear <= max,
  );

  const jumpToEra = (era: (typeof SKYLINE_ERAS)[number]) => {
    onEraSelect(era.id);
  };

  const progressLeft =
    ((scrubBounds.min - min) / (max - min || 1)) * 100;
  const progressWidth =
    ((value - scrubBounds.min) / (max - min || 1)) * 100;

  return (
    <div className="mx-auto flex w-full max-w-4xl flex-col gap-4 px-6">
      {/* Era chips */}
      <div className="flex flex-wrap justify-center gap-2">
        {visibleEras.map((e) => {
          const filtered = eraFilterId === e.id;
          return (
            <button
              key={e.id}
              type="button"
              onClick={() => jumpToEra(e)}
              className={[
                "border px-3 py-1 text-[11px] tracking-wider uppercase transition-colors",
                filtered
                  ? "border-[var(--accent)] bg-[var(--accent)] text-white"
                  : "border-[var(--line)] text-[var(--ink-muted)] hover:border-[var(--steel-bright)] hover:text-[var(--ink-soft)]",
              ].join(" ")}
              aria-pressed={filtered}
            >
              {e.label}
            </button>
          );
        })}
      </div>

      <p
        className="text-center text-xs leading-relaxed text-[var(--ink-muted)]"
        key={displayEra.id}
      >
        <span className="tracking-[0.18em] text-[var(--accent)] uppercase">
          {displayEra.label}
        </span>
        {eraFilter ? (
          <span className="ml-1.5 text-[9px] tracking-[0.16em] text-[var(--ink-muted)] normal-case">
            · filtered
          </span>
        ) : null}
        <span aria-hidden> — </span>
        {displayEra.tagline}
      </p>

      {/* Slider + fixed-width year on the right */}
      <div className="flex items-center gap-4 sm:gap-5">
        <div className="relative min-w-0 flex-1 pt-1">
          <div
            className="timeline-era-track relative h-2 overflow-hidden rounded-full"
            aria-hidden
          >
            {visibleEras.map((e) => {
              const segStart = Math.max(e.startYear, min);
              const segEnd = Math.min(e.endYear, max);
              const left = ((segStart - min) / (max - min || 1)) * 100;
              const width = ((segEnd - segStart) / (max - min || 1)) * 100;
              const highlighted = eraFilterId === e.id;
              return (
                <span
                  key={e.id}
                  className={[
                    `timeline-era-seg timeline-era-${e.id} absolute inset-y-0`,
                    highlighted
                      ? "opacity-100 ring-1 ring-[var(--accent)]"
                      : "",
                  ].join(" ")}
                  style={{ left: `${left}%`, width: `${width}%` }}
                />
              );
            })}
            <span
              className="timeline-era-progress absolute inset-y-0 left-0 rounded-full bg-[var(--accent)]/35"
              style={{
                left: `${progressLeft}%`,
                width: `${progressWidth}%`,
              }}
            />
          </div>

          <input
            id="skyline-year"
            type="range"
            min={scrubBounds.min}
            max={scrubBounds.max}
            step={1}
            value={value}
            onChange={(e) => onChange(Number(e.target.value))}
            onInput={(e) =>
              onChange(Number((e.target as HTMLInputElement).value))
            }
            className="cinematic-range absolute inset-x-0 top-1 w-full"
            aria-valuemin={scrubBounds.min}
            aria-valuemax={scrubBounds.max}
            aria-valuenow={value}
            aria-label="Scrub skyline through time"
          />
        </div>

        <p className="timeline-year w-[4.5ch] shrink-0 text-right text-2xl font-semibold tabular-nums tracking-tight text-[var(--ink)] sm:text-3xl">
          {value}
        </p>
      </div>
    </div>
  );
}
