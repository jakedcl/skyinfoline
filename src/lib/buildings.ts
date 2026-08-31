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

/** Neighbors in current display order (left → right). */
export function skylineNeighbors(
  buildings: Building[],
  selectedId: string | null,
  scrubYear?: number,
  sortDirection: SortDirection = "desc",
): { prevId: string | null; nextId: string | null } {
  const row = sortedByOrder(buildings, sortDirection).filter((b) =>
    scrubYear == null ? true : isBuiltByYear(b, scrubYear),
  );
  const index = selectedId ? row.findIndex((b) => b.id === selectedId) : -1;
  if (index < 0) return { prevId: null, nextId: null };
  return {
    prevId: index > 0 ? row[index - 1].id : null,
    nextId: index < row.length - 1 ? row[index + 1].id : null,
  };
}

