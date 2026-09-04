export type Era = {
  id: string;
  label: string;
  startYear: number;
  endYear: number;
  tagline: string;
};

/**
 * NYC skyline eras — each chip filters to towers completed in that window.
 * Boundaries align with our seeded building dataset (1902–2025) so scrub-year
 * captions match the towers actually on the skyline (no naming Chrysler in
 * 1928 while only Flatiron / Met Life / Woolworth stand).
 */
export const SKYLINE_ERAS: Era[] = [
  {
    id: "early",
    label: "Early Skyscrapers",
    startYear: 1900,
    endYear: 1929,
    tagline: "Flatiron, Met Life, Woolworth — the first towers reshape the horizon",
  },
  {
    id: "art-deco",
    label: "Art Deco",
    startYear: 1930,
    endYear: 1949,
    tagline: "Chrysler, Empire State, 30 Rock — the race to the sky",
  },
  {
    id: "midcentury",
    label: "Midcentury Modern",
    startYear: 1950,
    endYear: 1969,
    tagline: "Lever House, Seagram, MetLife — glass and steel take over",
  },
  {
    id: "late-modern",
    label: "Late Modern",
    startYear: 1970,
    endYear: 2005,
    tagline: "Twin Towers, Citigroup, 550 Madison — expressionism and postmodern peaks",
  },
  {
    id: "millennium",
    label: "New Millennium",
    startYear: 2006,
    endYear: 2013,
    tagline: "Hearst, 8 Spruce, Bank of America — the skyline rebuilds after 9/11",
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

export function erasByIds(ids: string[]): Era[] {
  if (ids.length === 0) return [];
  const set = new Set(ids);
  return SKYLINE_ERAS.filter((e) => set.has(e.id));
}

/** Year to jump to when an era chip is pressed — end of chapter, capped at timeline max. */
export function eraJumpYear(era: Era, timelineMax: number): number {
  return Math.min(era.endYear, timelineMax);
}

/** Scrub range when one or more era filters are active (union of windows). */
export function eraScrubBounds(
  eras: Era | Era[],
  timelineMin: number,
  timelineMax: number,
): { min: number; max: number } {
  const list = Array.isArray(eras) ? eras : [eras];
  if (list.length === 0) {
    return { min: timelineMin, max: timelineMax };
  }
  const start = Math.min(...list.map((e) => e.startYear));
  const end = Math.max(...list.map((e) => e.endYear));
  return {
    min: Math.max(start, timelineMin),
    max: Math.min(end, timelineMax),
  };
}

export function eraProgress(year: number, era: Era): number {
  const span = era.endYear - era.startYear || 1;
  return Math.min(1, Math.max(0, (year - era.startYear) / span));
}
