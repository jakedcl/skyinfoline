"use client";

import { eraForYear, erasByIds, SKYLINE_ERAS } from "@/lib/eras";

type CinematicTimelineProps = {
  min: number;
  max: number;
  value: number;
  eraFilterIds?: string[];
  onChange: (year: number) => void;
  /** Leave era-filter mode and restore year scrubbing (keep last scrub year). */
  onResumeTimeline: () => void;
  onEraSelect: (eraId: string) => void;
};

export function CinematicTimeline({
  min,
  max,
  value,
  eraFilterIds = [],
  onChange,
  onResumeTimeline,
  onEraSelect,
}: CinematicTimelineProps) {
  const filtering = eraFilterIds.length > 0;
  const eraFilters = erasByIds(eraFilterIds);
  const displayEra =
    eraFilters.length === 1 ? eraFilters[0] : eraForYear(value);
  const filterTitle =
    eraFilters.length === 0
      ? null
      : eraFilters.length === 1
        ? eraFilters[0].label
        : eraFilters.map((e) => e.label).join(" + ");

  const visibleEras = SKYLINE_ERAS.filter(
    (e) => e.endYear >= min && e.startYear <= max,
  );

  const progressWidth = ((value - min) / (max - min || 1)) * 100;

  return (
    <div className="operator-deck__plate mx-auto w-full max-w-5xl px-4 py-4 sm:px-5 sm:py-5">
      {/* Era breakers — multi-select toggles */}
      <div
        className="flex flex-wrap gap-2 sm:gap-2.5"
        role="group"
        aria-label="Era circuit filters"
      >
        {visibleEras.map((e) => {
          const filtered = eraFilterIds.includes(e.id);
          return (
            <button
              key={e.id}
              type="button"
              onClick={() => onEraSelect(e.id)}
              className={["operator-breaker", filtered ? "is-active" : ""].join(
                " ",
              )}
              aria-pressed={filtered}
            >
              <span className="operator-breaker__toggle" aria-hidden />
              <span className="operator-breaker__label">{e.label}</span>
            </button>
          );
        })}
      </div>

      <div className="operator-readout" key={filterTitle ?? displayEra.id}>
        <span className="operator-readout__title">
          {filterTitle ?? displayEra.label}
        </span>
        {filtering ? (
          <span className="ml-2 text-[9px] tracking-[0.14em] text-[#8a98a6] uppercase">
            filtered
          </span>
        ) : null}
        <span className="mx-1.5 text-[#5c6670]">—</span>
        <span>
          {eraFilters.length <= 1
            ? displayEra.tagline
            : "Multiple eras engaged — towers completed in any selected window"}
        </span>
      </div>

      {/* DIN-rail year scrubber — inactive while era filters are on */}
      <div className="operator-rail">
        <div className="flex items-center gap-3 sm:gap-4">
          <p
            className="operator-rail__year"
            aria-live="polite"
            aria-label={filtering ? "Timeline paused while filtering" : undefined}
          >
            {filtering ? "—" : value}
          </p>

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
                const highlighted = eraFilterIds.includes(e.id);
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
              {!filtering ? (
                <span
                  className="timeline-era-progress absolute inset-y-0 left-0 bg-[var(--op-signal)]/40"
                  style={{ width: `${progressWidth}%` }}
                />
              ) : null}
            </div>

            {filtering ? (
              <button
                type="button"
                className="cinematic-range cinematic-range--resume absolute inset-x-0 top-0 w-full"
                onPointerDown={onResumeTimeline}
                onClick={onResumeTimeline}
                aria-label="Return to timeline scrubbing"
              />
            ) : (
              <input
                id="skyline-year"
                type="range"
                min={min}
                max={max}
                step={1}
                value={value}
                onChange={(e) => onChange(Number(e.target.value))}
                onInput={(e) =>
                  onChange(Number((e.target as HTMLInputElement).value))
                }
                className="cinematic-range absolute inset-x-0 top-0 w-full"
                aria-valuemin={min}
                aria-valuemax={max}
                aria-valuenow={value}
                aria-label="Scrub skyline through time"
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
