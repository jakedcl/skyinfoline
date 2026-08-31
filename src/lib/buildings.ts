import type { Building } from "@/types/building";

export function sortedByOrder(buildings: Building[]): Building[] {
  // Jersey City view: left = north (higher orderIndex), right = south
  return [...buildings].sort((a, b) => b.orderIndex - a.orderIndex);
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
  for (const b of buildings) {
    min = Math.min(min, b.yearCompleted);
    max = Math.max(max, b.yearCompleted);
  }
  return { min, max };
}

/** Dim / hide towers not yet completed at the scrub year */
export function isBuiltByYear(building: Building, year: number): boolean {
  return building.yearCompleted <= year;
}

export function findBuilding(
  buildings: Building[],
  id: string | null,
): Building | null {
  if (!id) return null;
  return buildings.find((b) => b.id === id) ?? null;
}

/** Neighbors in Jersey City display order (left = north, right = south). */
export function skylineNeighbors(
  buildings: Building[],
  selectedId: string | null,
  scrubYear?: number,
): { prevId: string | null; nextId: string | null } {
  const row = sortedByOrder(buildings).filter((b) =>
    scrubYear == null ? true : isBuiltByYear(b, scrubYear),
  );
  const index = selectedId ? row.findIndex((b) => b.id === selectedId) : -1;
  if (index < 0) return { prevId: null, nextId: null };
  return {
    prevId: index > 0 ? row[index - 1].id : null,
    nextId: index < row.length - 1 ? row[index + 1].id : null,
  };
}

