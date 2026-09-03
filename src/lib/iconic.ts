/**
 * Curated “greatest hits” for the mobile landing skyline.
 * Editable allowlist — ids must exist in buildings-seed.json.
 * Shown only on narrow viewports before the user scrubs or filters by era.
 */
export const ICONIC_LANDING_IDS = [
  "world-trade-center-north-tower",
  "world-trade-center-south-tower",
  "one-wtc",
  "empire-state",
  "chrysler",
  "woolworth",
  "flatiron-building",
  "central-park-tower",
  "30-hudson-yards",
  "citigroup-center",
] as const;

export const ICONIC_LANDING_ID_SET: ReadonlySet<string> = new Set(
  ICONIC_LANDING_IDS,
);

export function isIconicLandingId(id: string): boolean {
  return ICONIC_LANDING_ID_SET.has(id);
}
