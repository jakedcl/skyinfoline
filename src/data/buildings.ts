import type { Building } from "@/types/building";
import seedData from "./buildings-seed.json";

/**
 * Manhattan skyline seed data (local fallback when Sanity is empty).
 * Canonical source: src/data/buildings-seed.json — also used by npm run seed.
 */
export const buildings: Building[] = seedData as Building[];
