import type { Building } from "@/types/building";

/** Below this width, landing shows only the base tallest set. */
export const LANDING_PHONE_MAX_WIDTH_PX = 640;

/** At/above this width, landing shows every building. */
export const LANDING_DESKTOP_MIN_WIDTH_PX = 1024;

/** Always start with this many tallest towers on narrow viewports. */
export const LANDING_BASE_COUNT = 10;

/**
 * Extra next-tallest towers per px of width past the phone breakpoint.
 * ~24px ≈ one more tower every ~24px until desktop shows all.
 */
export const LANDING_EXPAND_SLOT_PX = 24;

/**
 * How many buildings to show on the pre-interaction landing skyline.
 *
 * - width < 640 → top 10 tallest
 * - 640 ≤ width < 1024 → 10 + round((width - 640) / 24), capped at total
 * - width ≥ 1024 → all buildings
 */
export function landingBuildingCount(
  viewportWidthPx: number,
  totalBuildings: number,
): number {
  if (totalBuildings <= 0) return 0;
  if (viewportWidthPx >= LANDING_DESKTOP_MIN_WIDTH_PX) return totalBuildings;
  if (viewportWidthPx < LANDING_PHONE_MAX_WIDTH_PX) {
    return Math.min(totalBuildings, LANDING_BASE_COUNT);
  }

  const extra = Math.round(
    (viewportWidthPx - LANDING_PHONE_MAX_WIDTH_PX) / LANDING_EXPAND_SLOT_PX,
  );
  return Math.min(totalBuildings, LANDING_BASE_COUNT + Math.max(0, extra));
}

/**
 * Landing subset: top-N by heightFt (tallest first), returned in input order so
 * Skyline can apply the usual orderIndex + viewpoint sort.
 */
export function selectLandingBuildings(
  buildings: Building[],
  viewportWidthPx: number,
): Building[] {
  const n = landingBuildingCount(viewportWidthPx, buildings.length);
  if (n >= buildings.length) return buildings;

  const ranked = [...buildings].sort((a, b) => {
    const heightDiff = b.heightFt - a.heightFt;
    if (heightDiff !== 0) return heightDiff;
    return a.orderIndex - b.orderIndex;
  });

  const keep = new Set(ranked.slice(0, n).map((b) => b.id));
  return buildings.filter((b) => keep.has(b.id));
}
