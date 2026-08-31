export type Era = {
  id: string;
  label: string;
  startYear: number;
  endYear: number;
  tagline: string;
};

/** NYC skyline eras — used for timeline segments and labels */
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
    endYear: 1999,
    tagline: "Postmodern peaks and downtown rebirth",
  },
  {
    id: "supertall",
    label: "Supertall Era",
    startYear: 2000,
    endYear: 2030,
    tagline: "One WTC, Billionaires' Row, Hudson Yards",
  },
];

export function eraForYear(year: number): Era {
  return (
    SKYLINE_ERAS.find((e) => year >= e.startYear && year <= e.endYear) ??
    SKYLINE_ERAS[SKYLINE_ERAS.length - 1]
  );
}

export function eraProgress(year: number, era: Era): number {
  const span = era.endYear - era.startYear || 1;
  return Math.min(1, Math.max(0, (year - era.startYear) / span));
}
