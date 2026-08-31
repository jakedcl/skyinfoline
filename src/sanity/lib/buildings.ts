import type { Building, BuildingSilhouette, BuildingStatus } from "@/types/building";
import { buildings as fallbackBuildings } from "@/data/buildings";
import { client } from "@/sanity/lib/client";
import { urlForCutout } from "@/sanity/lib/image";
import { BUILDINGS_QUERY } from "@/sanity/lib/queries";

type SanityBuilding = {
  id: string;
  name: string;
  heightFt: number;
  floors?: number;
  yearCompleted: number;
  architect?: string;
  status?: BuildingStatus;
  orderIndex: number;
  neighborhood?: string;
  silhouette?: BuildingSilhouette;
  shortBlurb?: string;
  wikipediaUrl?: string;
  cutout?: {
    asset?: { _ref: string; _type: string };
    alt?: string;
  };
};

function mapBuilding(doc: SanityBuilding): Building {
  const imageSrc =
    doc.cutout?.asset != null
      ? urlForCutout(doc.cutout).url()
      : undefined;

  return {
    id: doc.id,
    name: doc.name,
    heightFt: doc.heightFt,
    floors: doc.floors,
    yearCompleted: doc.yearCompleted,
    architect: doc.architect,
    status: doc.status ?? "completed",
    orderIndex: doc.orderIndex,
    neighborhood: doc.neighborhood,
    silhouette: doc.silhouette ?? "rect",
    shortBlurb: doc.shortBlurb,
    wikipediaUrl: doc.wikipediaUrl,
    imageSrc,
  };
}

/** Load buildings from Sanity; fall back to local seed if empty/unavailable. */
export async function getBuildings(): Promise<Building[]> {
  try {
    const docs = await client.fetch<SanityBuilding[]>(BUILDINGS_QUERY);
    if (!docs?.length) return fallbackBuildings;
    return docs.map(mapBuilding);
  } catch (error) {
    console.error("Sanity buildings fetch failed; using local fallback.", error);
    return fallbackBuildings;
  }
}
