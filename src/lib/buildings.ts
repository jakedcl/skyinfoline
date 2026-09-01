import type { Building } from "@/types/building";
import type { SortDirection } from "@/lib/viewpoints";

export function sortedByOrder(
  buildings: Building[],
  direction: SortDirection = "desc",
): Building[] {
  return [...buildings].sort((a, b) =>
    direction === "desc"
      ? b.orderIndex - a.orderIndex
      : a.orderIndex - b.orderIndex,
  );
}

export function maxHeight(buildings: Building[]): number {
  return buildings.reduce((max, b) => Math.max(max, b.heightFt), 0);
}

export function yearRange(buildings: Building[]): { min: number; max: number } {
  if (buildings.length === 0) {
    const now = new Date().getFullYear();
    return { min: now, max: now };
  }
  let min = buildings[0].yearCompleted;
  let max = buildings[0].yearCompleted;
  const now = new Date().getFullYear();
  for (const b of buildings) {
    min = Math.min(min, b.yearCompleted);
    max = Math.max(max, b.yearCompleted);
    if (b.yearDemolished != null) {
      max = Math.max(max, b.yearDemolished);
    }
  }
  return { min, max: Math.max(max, now) };
}

/** True when the tower is on the skyline at this scrub year */
export function isVisibleAtYear(building: Building, year: number): boolean {
  if (year < building.yearCompleted) return false;
  if (building.yearDemolished != null && year > building.yearDemolished) {
    return false;
  }
  return true;
}

/** @deprecated Use isVisibleAtYear */
export function isBuiltByYear(building: Building, year: number): boolean {
  return isVisibleAtYear(building, year);
}

export function buildingsVisibleAtYear(
  buildings: Building[],
  year: number,
): Building[] {
  return buildings.filter((b) => isVisibleAtYear(b, year));
}

/** @deprecated Use buildingsVisibleAtYear */
export function buildingsBuiltByYear(
  buildings: Building[],
  year: number,
): Building[] {
  return buildingsVisibleAtYear(buildings, year);
}

export function findBuilding(
  buildings: Building[],
  id: string | null,
): Building | null {
  if (!id) return null;
  return buildings.find((b) => b.id === id) ?? null;
}

/** Neighbors in current display order (left → right). */
export function skylineNeighbors(
  buildings: Building[],
  selectedId: string | null,
  scrubYear?: number,
  sortDirection: SortDirection = "desc",
): { prevId: string | null; nextId: string | null } {
  const row = sortedByOrder(buildings, sortDirection).filter((b) =>
    scrubYear == null ? true : isVisibleAtYear(b, scrubYear),
  );
  const index = selectedId ? row.findIndex((b) => b.id === selectedId) : -1;
  if (index < 0) return { prevId: null, nextId: null };
  return {
    prevId: index > 0 ? row[index - 1].id : null,
    nextId: index < row.length - 1 ? row[index + 1].id : null,
  };
}

