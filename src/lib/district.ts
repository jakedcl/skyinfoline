import type { Feature, FeatureCollection, MultiPolygon, Polygon } from "geojson";
import { getOutlines, publicBuildings } from "./catalog";
import { showDate } from "./presentation";
import type { Building } from "./types";

// Lower Manhattan south of Chambers Street and the Brooklyn Bridge approach, river to river.
export const districtBoundary: [number, number][] = [
  [-74.0205, 40.7185], [-74.0155, 40.7180], [-74.0105, 40.7163], [-74.0066, 40.7148],
  [-74.0037, 40.7139], [-74.0012, 40.7116], [-73.9988, 40.7092], [-73.9945, 40.7075],
  [-73.9985, 40.7000], [-74.0090, 40.6975], [-74.0200, 40.7010], [-74.0225, 40.7100],
  [-74.0205, 40.7185],
];

const feetToMeters = 0.3048;

export type DistrictBuilding = {
  id: string;
  name: string;
  status: string;
  roofFeet: number;
  year: string | null;
  center: [number, number];
};

export type DistrictShapes = FeatureCollection<Polygon | MultiPolygon, { id: string; height: number }>;

function inside([lon, lat]: [number, number], ring: [number, number][]) {
  let hit = false;
  for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) {
    const [xi, yi] = ring[i];
    const [xj, yj] = ring[j];
    if ((yi > lat) !== (yj > lat) && lon < ((xj - xi) * (lat - yi)) / (yj - yi) + xi) hit = !hit;
  }
  return hit;
}

// Only the City footprint roof height is used: it is measured from the building's lowest ground
// to the main roof, so crowns, spires and setbacks are not represented.
function roofHeight(building: Building) {
  const roof = building.measurements?.heights?.find((height) =>
    height.type === "roof" && height.unit === "ft" && height.condition === "observed" &&
    height.reference === "lowest_building_ground" && height.value > 0,
  );
  return roof?.value ?? null;
}

function buildDistrict() {
  const buildings: DistrictBuilding[] = [];
  const features: Feature<Polygon | MultiPolygon, { id: string; height: number }>[] = [];

  for (const building of publicBuildings) {
    const point = building.spatial?.point;
    const roofFeet = roofHeight(building);
    if (!point || !roofFeet || building.status?.value !== "standing") continue;
    const center: [number, number] = [point.lon, point.lat];
    if (!inside(center, districtBoundary)) continue;
    const outlines = getOutlines(building.id);
    if (!outlines) continue;

    const date = building.dates?.opening ?? building.dates?.completion ?? building.dates?.construction;
    buildings.push({ id: building.id, name: building.canonical_name, status: "standing", roofFeet, year: showDate(date), center });
    for (const outline of outlines.features) {
      features.push({
        type: "Feature",
        geometry: outline.geometry,
        properties: { id: building.id, height: Math.round(roofFeet * feetToMeters * 10) / 10 },
      });
    }
  }

  buildings.sort((a, b) => b.roofFeet - a.roofFeet);
  const shapes: DistrictShapes = { type: "FeatureCollection", features };
  return { buildings, shapes };
}

let district: ReturnType<typeof buildDistrict> | undefined;

export function lowerManhattanDistrict() {
  district ??= buildDistrict();
  return district;
}
