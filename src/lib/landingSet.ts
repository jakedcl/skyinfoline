import type { Building } from "@/types/building";
import { SKYLINE_SCROLL_PAD_PX } from "@/lib/skyline-layout";

/** At/above this width, landing shows every building. */
export const LANDING_DESKTOP_MIN_WIDTH_PX = 1024;

/** Never thin the landing set below this many towers. */
export const LANDING_MIN_COUNT = 4;

/**
 * Target average horizontal slot per tower (px), including gap.
 * Narrow phones → taller towers via fewer slots; tablets get a bit more room.
 */
export function landingTargetSlotPx(viewportWidthPx: number): number {
  if (viewportWidthPx < 480) return 64;
  if (viewportWidthPx < 768) return 70;
  if (viewportWidthPx < LANDING_DESKTOP_MIN_WIDTH_PX) return 84;
  return 56;
}

/**
 * How many buildings to show on the pre-interaction landing skyline.
 *
 * N = clamp(round(availableWidth / targetSlot), minN, total)
 * Desktop-like widths (>=1024) → all buildings.
 */
export function landingBuildingCount(
  viewportWidthPx: number,
  totalBuildings: number,
  availableWidthPx?: number,
): number {
  if (totalBuildings <= 0) return 0;
  if (viewportWidthPx >= LANDING_DESKTOP_MIN_WIDTH_PX) return totalBuildings;

  const available =
    availableWidthPx ??
    Math.max(0, viewportWidthPx - SKYLINE_SCROLL_PAD_PX * 2);
  const targetSlot = landingTargetSlotPx(viewportWidthPx);
  if (available <= 0 || targetSlot <= 0) {
    return Math.min(totalBuildings, LANDING_MIN_COUNT);
  }

  const n = Math.round(available / targetSlot);
  return Math.min(totalBuildings, Math.max(LANDING_MIN_COUNT, n));
}

function importanceOf(building: Building): number {
  return building.skylineImportance ?? 5;
}

/**
 * Landing subset: top-N by skylineImportance, returned in input order so
 * Skyline can apply the usual orderIndex + viewpoint sort.
 */
export function selectLandingBuildings(
  buildings: Building[],
  viewportWidthPx: number,
  availableWidthPx?: number,
): Building[] {
  const n = landingBuildingCount(
    viewportWidthPx,
    buildings.length,
    availableWidthPx,
  );
  if (n >= buildings.length) return buildings;

  const ranked = [...buildings].sort((a, b) => {
    const impDiff = importanceOf(b) - importanceOf(a);
    if (impDiff !== 0) return impDiff;
    return a.orderIndex - b.orderIndex;
  });

  const keep = new Set(ranked.slice(0, n).map((b) => b.id));
  return buildings.filter((b) => keep.has(b.id));
}
