export type Era = {
  id: string;
  label: string;
  startYear: number;
  endYear: number;
  tagline: string;
};

/**
 * NYC skyline eras — each chip filters to towers completed in that window.
 * Boundaries align with our seeded building dataset (1902–2025).
 */
export const SKYLINE_ERAS: Era[] = [
  {
    id: "early",
    label: "Early Skyscrapers",
    startYear: 1900,
    endYear: 1919,
    tagline: "Flatiron, Woolworth — the first towers reshape the horizon",
  },
  {
    id: "art-deco",
    label: "Art Deco",
    startYear: 1920,
    endYear: 1939,
    tagline: "Chrysler, Empire State, 30 Rock — the race to the sky",
  },
  {
    id: "midcentury",
    label: "Midcentury Modern",
    startYear: 1940,
    endYear: 1969,
    tagline: "Lever House, Seagram, Pan Am — glass and steel take over",
  },
  {
    id: "late-modern",
    label: "Late Modern",
    startYear: 1970,
    endYear: 1999,
    tagline: "Twin Towers, Citicorp, AT&T — expressionism and postmodern peaks",
  },
  {
    id: "millennium",
    label: "New Millennium",
    startYear: 2000,
    endYear: 2013,
    tagline: "Hearst, Gehry, Bank of America — downtown rebuilds after 9/11",
  },
  {
    id: "supertall",
    label: "Supertall Era",
    startYear: 2014,
    endYear: 2030,
    tagline: "One WTC, Billionaires' Row, Hudson Yards — the skyline today",
  },
];

export function eraForYear(year: number): Era {
  return (
    SKYLINE_ERAS.find((e) => year >= e.startYear && year <= e.endYear) ??
    SKYLINE_ERAS[SKYLINE_ERAS.length - 1]
  );
}

export function eraById(id: string | null | undefined): Era | null {
  if (!id) return null;
  return SKYLINE_ERAS.find((e) => e.id === id) ?? null;
}

/** Year to jump to when an era chip is pressed — end of chapter, capped at timeline max. */
export function eraJumpYear(era: Era, timelineMax: number): number {
  return Math.min(era.endYear, timelineMax);
}

/** Scrub range when an era filter is active. */
export function eraScrubBounds(
  era: Era,
  timelineMin: number,
  timelineMax: number,
): { min: number; max: number } {
  return {
    min: Math.max(era.startYear, timelineMin),
    max: Math.min(era.endYear, timelineMax),
  };
}

export function eraProgress(year: number, era: Era): number {
  const span = era.endYear - era.startYear || 1;
  return Math.min(1, Math.max(0, (year - era.startYear) / span));
}
