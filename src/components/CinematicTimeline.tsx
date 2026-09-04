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
    <div className="operator-deck__plate mx-auto w-full max-w-5xl px-4 py-4 sm:px-5 sm:py-5">
      {/* Era breakers */}
      <div
        className="flex flex-wrap gap-2 sm:gap-2.5"
        role="group"
        aria-label="Era circuit filters"
      >
        {visibleEras.map((e) => {
          const filtered = eraFilterId === e.id;
          return (
            <button
              key={e.id}
              type="button"
              onClick={() => jumpToEra(e)}
              className={[
                "operator-breaker",
                filtered ? "is-active" : "",
              ].join(" ")}
              aria-pressed={filtered}
            >
              <span className="operator-breaker__toggle" aria-hidden />
              <span className="operator-breaker__label">{e.label}</span>
            </button>
          );
        })}
      </div>

      <div className="operator-readout" key={displayEra.id}>
        <span className="operator-readout__title">{displayEra.label}</span>
        {eraFilter ? (
          <span className="ml-2 text-[9px] tracking-[0.14em] text-[#8a98a6] uppercase">
            filtered
          </span>
        ) : null}
        <span className="mx-1.5 text-[#5c6670]">—</span>
        <span>{displayEra.tagline}</span>
      </div>

      {/* DIN-rail year scrubber */}
      <div className="operator-rail">
        <div className="flex items-center gap-3 sm:gap-4">
          <p className="operator-rail__year">{value}</p>

          <div className="relative min-w-0 flex-1 pt-1">
            <div
              className="timeline-era-track relative overflow-hidden"
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
                        ? "opacity-100 ring-1 ring-[var(--op-signal)]"
                        : "",
                    ].join(" ")}
                    style={{ left: `${left}%`, width: `${width}%` }}
                  />
                );
              })}
              <span
                className="timeline-era-progress absolute inset-y-0 left-0 bg-[var(--op-signal)]/40"
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
              className="cinematic-range absolute inset-x-0 top-0 w-full"
              aria-valuemin={scrubBounds.min}
              aria-valuemax={scrubBounds.max}
              aria-valuenow={value}
              aria-label="Scrub skyline through time"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
