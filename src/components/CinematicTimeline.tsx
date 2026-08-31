"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { eraForYear, eraProgress, SKYLINE_ERAS } from "@/lib/eras";

type CinematicTimelineProps = {
  min: number;
  max: number;
  value: number;
  onChange: (year: number) => void;
};

const PLAY_MS_PER_YEAR = 55;

export function CinematicTimeline({
  min,
  max,
  value,
  onChange,
}: CinematicTimelineProps) {
  const [playing, setPlaying] = useState(false);
  const rafRef = useRef<number | null>(null);
  const lastTickRef = useRef(0);
  const valueRef = useRef(value);
  const onChangeRef = useRef(onChange);

  valueRef.current = value;
  onChangeRef.current = onChange;

  const era = eraForYear(value);
  const progress = eraProgress(value, era);

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
        const next = Math.min(max, valueRef.current + steps);
        onChangeRef.current(next);
        if (next >= max) {
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
  }, [playing, max, stopPlayback]);

  useEffect(() => () => stopPlayback(), [stopPlayback]);

  const jumpToEra = (startYear: number) => {
    stopPlayback();
    onChange(Math.max(min, Math.min(max, startYear)));
  };

  const nudge = (delta: number) => {
    stopPlayback();
    onChange(Math.min(max, Math.max(min, value + delta)));
  };

  const togglePlay = () => {
    if (playing) {
      stopPlayback();
    } else if (value >= max) {
      onChange(min);
      startPlayback();
    } else {
      startPlayback();
    }
  };

  const trackPct = ((value - min) / (max - min || 1)) * 100;

  return (
    <div className="mx-auto flex w-full max-w-4xl flex-col gap-5 px-6">
      {/* Era + year display */}
      <div className="flex flex-col items-center gap-2 text-center">
        <p
          className="text-xs tracking-[0.28em] text-[var(--accent)] uppercase transition-opacity duration-300"
          key={era.id}
        >
          {era.label}
        </p>
        <p className="timeline-year text-6xl font-semibold tabular-nums tracking-tight text-[var(--ink)] md:text-7xl">
          {value}
        </p>
        <p className="max-w-md text-sm leading-relaxed text-[var(--ink-muted)]">
          {era.tagline}
        </p>
      </div>

      {/* Era chips */}
      <div className="flex flex-wrap justify-center gap-2">
        {SKYLINE_ERAS.filter((e) => e.endYear >= min && e.startYear <= max).map(
          (e) => {
            const active = value >= e.startYear && value <= e.endYear;
            return (
              <button
                key={e.id}
                type="button"
                onClick={() => jumpToEra(e.startYear)}
                className={[
                  "border px-3 py-1 text-[11px] tracking-wider uppercase transition-colors",
                  active
                    ? "border-[var(--accent)] bg-[var(--accent)]/10 text-[var(--accent)]"
                    : "border-[var(--line)] text-[var(--ink-muted)] hover:border-[var(--steel-bright)] hover:text-[var(--ink-soft)]",
                ].join(" ")}
              >
                {e.label}
              </button>
            );
          },
        )}
      </div>

      {/* Track with era segments */}
      <div className="relative pt-2">
        <div
          className="timeline-era-track relative h-2 overflow-hidden rounded-full"
          aria-hidden
        >
          {SKYLINE_ERAS.filter((e) => e.endYear >= min && e.startYear <= max).map(
            (e) => {
              const segStart = Math.max(e.startYear, min);
              const segEnd = Math.min(e.endYear, max);
              const left =
                ((segStart - min) / (max - min || 1)) * 100;
              const width =
                ((segEnd - segStart) / (max - min || 1)) * 100;
              return (
                <span
                  key={e.id}
                  className={`timeline-era-seg timeline-era-${e.id} absolute inset-y-0`}
                  style={{ left: `${left}%`, width: `${width}%` }}
                />
              );
            },
          )}
          <span
            className="timeline-era-progress absolute inset-y-0 left-0 rounded-full bg-[var(--accent)]/35"
            style={{ width: `${trackPct}%` }}
          />
        </div>

        <input
          id="skyline-year"
          type="range"
          min={min}
          max={max}
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
          aria-valuemin={min}
          aria-valuemax={max}
          aria-valuenow={value}
          aria-label="Scrub skyline through time"
        />
      </div>

      {/* Controls */}
      <div className="flex items-center justify-between gap-4">
        <span className="text-[11px] tracking-wider text-[var(--ink-muted)] uppercase tabular-nums">
          {min}
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
          {max}
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
