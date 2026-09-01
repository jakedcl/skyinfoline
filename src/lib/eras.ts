export type Era = {
  id: string;
  label: string;
  startYear: number;
  endYear: number;
  tagline: string;
};

/** NYC skyline eras — chip jumps to endYear (peak of that chapter). */
export const SKYLINE_ERAS: Era[] = [
  {
    id: "early",
    label: "Early Skyscrapers",
    startYear: 1900,
    endYear: 1919,
    tagline: "Woolworth era — towers reach for the clouds",
  },
  {
    id: "art-deco",
    label: "Art Deco",
    startYear: 1920,
    endYear: 1939,
    tagline: "Chrysler, Empire State — the race to the sky",
  },
  {
    id: "wartime",
    label: "Wartime & Recovery",
    startYear: 1940,
    endYear: 1959,
    tagline: "A pause, then mid-century modernism",
  },
  {
    id: "modern",
    label: "International Style",
    startYear: 1960,
    endYear: 1979,
    tagline: "Seagram, Citicorp — glass and steel",
  },
  {
    id: "corporate",
    label: "Corporate Towers",
    startYear: 1980,
    endYear: 2000,
    tagline: "Postmodern peaks — Twin Towers crown the century",
  },
  {
    id: "millennium",
    label: "Millennium & Rebuild",
    startYear: 2001,
    endYear: 2013,
    tagline: "After 9/11 — downtown rebuilds, Gehry rises downtown",
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

/** Year to jump to when an era chip is pressed — end of chapter, capped at timeline max. */
export function eraJumpYear(era: Era, timelineMax: number): number {
  return Math.min(era.endYear, timelineMax);
}

export function eraProgress(year: number, era: Era): number {
  const span = era.endYear - era.startYear || 1;
  return Math.min(1, Math.max(0, (year - era.startYear) / span));
}
