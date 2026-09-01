"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  eraById,
  eraForYear,
  eraJumpYear,
  eraProgress,
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

const PLAY_MS_PER_YEAR = 55;

export function CinematicTimeline({
  min,
  max,
  value,
  eraFilterId = null,
  onChange,
  onEraSelect,
}: CinematicTimelineProps) {
  const [playing, setPlaying] = useState(false);
  const rafRef = useRef<number | null>(null);
  const lastTickRef = useRef(0);
  const valueRef = useRef(value);
  const onChangeRef = useRef(onChange);

  valueRef.current = value;
  onChangeRef.current = onChange;

  const eraFilter = eraById(eraFilterId);
  const scrubBounds = eraFilter
    ? eraScrubBounds(eraFilter, min, max)
    : { min, max };
  const displayEra = eraFilter ?? eraForYear(value);
  const progress = eraProgress(value, displayEra);

  const stopPlayback = useCallback(() => {
    setPlaying(false);
    if (rafRef.current != null) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }
  }, []);

  const startPlayback = useCallback(() => {
    setPlaying(true);
    lastTickRef.current = performance.now();
  }, []);

  useEffect(() => {
    if (!playing) return;

    const tick = (now: number) => {
      const elapsed = now - lastTickRef.current;
      if (elapsed >= PLAY_MS_PER_YEAR) {
        const steps = Math.floor(elapsed / PLAY_MS_PER_YEAR);
        lastTickRef.current += steps * PLAY_MS_PER_YEAR;
        const next = Math.min(scrubBounds.max, valueRef.current + steps);
        onChangeRef.current(next);
        if (next >= scrubBounds.max) {
          stopPlayback();
          return;
        }
      }
      rafRef.current = requestAnimationFrame(tick);
    };

    rafRef.current = requestAnimationFrame(tick);
    return () => {
      if (rafRef.current != null) cancelAnimationFrame(rafRef.current);
    };
  }, [playing, scrubBounds.max, stopPlayback]);

  useEffect(() => () => stopPlayback(), [stopPlayback]);

  const visibleEras = SKYLINE_ERAS.filter(
    (e) => e.endYear >= min && e.startYear <= max,
  );

  const jumpToEra = (era: (typeof SKYLINE_ERAS)[number]) => {
    stopPlayback();
    onEraSelect(era.id);
  };

  const nudge = (delta: number) => {
    stopPlayback();
    onChange(
      Math.min(scrubBounds.max, Math.max(scrubBounds.min, value + delta)),
    );
  };

  const togglePlay = () => {
    if (playing) {
      stopPlayback();
    } else if (value >= scrubBounds.max) {
      onChange(scrubBounds.min);
      startPlayback();
    } else {
      startPlayback();
    }
  };

  const progressLeft =
    ((scrubBounds.min - min) / (max - min || 1)) * 100;
  const progressWidth =
    ((value - scrubBounds.min) / (max - min || 1)) * 100;

  return (
    <div className="mx-auto flex w-full max-w-4xl flex-col gap-5 px-6">
      {/* Era + year display */}
      <div className="flex flex-col items-center gap-2 text-center">
        <p
          className="text-xs tracking-[0.28em] text-[var(--accent)] uppercase transition-opacity duration-300"
          key={displayEra.id}
        >
          {displayEra.label}
          {eraFilter ? (
            <span className="ml-2 text-[10px] tracking-[0.2em] text-[var(--ink-muted)] normal-case">
              · filtered
            </span>
          ) : null}
        </p>
        <p className="timeline-year text-6xl font-semibold tabular-nums tracking-tight text-[var(--ink)] md:text-7xl">
          {value}
        </p>
        <p className="max-w-md text-sm leading-relaxed text-[var(--ink-muted)]">
          {displayEra.tagline}
        </p>
      </div>

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

      {/* Track with era segments */}
      <div className="relative pt-2">
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
                  highlighted ? "opacity-100 ring-1 ring-[var(--accent)]" : "",
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
          onChange={(e) => {
            stopPlayback();
            onChange(Number(e.target.value));
          }}
          onInput={(e) => {
            stopPlayback();
            onChange(Number((e.target as HTMLInputElement).value));
          }}
          className="cinematic-range absolute inset-x-0 top-2 w-full"
          aria-valuemin={scrubBounds.min}
          aria-valuemax={scrubBounds.max}
          aria-valuenow={value}
          aria-label="Scrub skyline through time"
        />
      </div>

      {/* Controls */}
      <div className="flex items-center justify-between gap-4">
        <span className="text-[11px] tracking-wider text-[var(--ink-muted)] uppercase tabular-nums">
          {scrubBounds.min}
        </span>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => nudge(-10)}
            className="border border-[var(--line)] px-2.5 py-1.5 text-xs text-[var(--ink-muted)] transition-colors hover:border-[var(--accent)] hover:text-[var(--accent)]"
            aria-label="Go back 10 years"
          >
            −10
          </button>

          <button
            type="button"
            onClick={togglePlay}
            className={[
              "flex h-10 min-w-[5.5rem] items-center justify-center gap-2 border px-4 text-xs tracking-wider uppercase transition-colors",
              playing
                ? "border-[var(--accent)] bg-[var(--accent)] text-white"
                : "border-[var(--line)] text-[var(--ink-soft)] hover:border-[var(--accent)] hover:text-[var(--accent)]",
            ].join(" ")}
            aria-pressed={playing}
            aria-label={playing ? "Pause timeline" : "Play timeline"}
          >
            {playing ? (
              <>
                <span className="inline-block h-2.5 w-2.5 bg-current" />
                Pause
              </>
            ) : (
              <>
                <span className="inline-block border-y-[5px] border-l-[8px] border-y-transparent border-l-current" />
                Play
              </>
            )}
          </button>

          <button
            type="button"
            onClick={() => nudge(10)}
            className="border border-[var(--line)] px-2.5 py-1.5 text-xs text-[var(--ink-muted)] transition-colors hover:border-[var(--accent)] hover:text-[var(--accent)]"
            aria-label="Go forward 10 years"
          >
            +10
          </button>
        </div>

        <span className="text-[11px] tracking-wider text-[var(--ink-muted)] uppercase tabular-nums">
          {scrubBounds.max}
        </span>
      </div>

      {/* Era progress bar under controls */}
      <div className="h-0.5 overflow-hidden rounded-full bg-[var(--line)]">
        <div
          className="h-full bg-[var(--accent)] transition-[width] duration-150 ease-out"
          style={{ width: `${progress * 100}%` }}
        />
      </div>
    </div>
  );
}
