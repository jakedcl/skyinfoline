import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { createClient } from "next-sanity";

const __dirname = dirname(fileURLToPath(import.meta.url));
const buildings = JSON.parse(
  readFileSync(join(__dirname, "../src/data/buildings-seed.json"), "utf8"),
);

const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET || "production",
  apiVersion: "2025-08-25",
  token: process.env.SANITY_WRITE_TOKEN,
  useCdn: false,
});

const deprecatedIds = [
  "building-twin-towers",
  "building-thirty-park-place",
  "building-fifty-six-leonard",
  "building-trump-international",
  // duplicate slugs from first seed pass
  "building-one-world-trade-center",
  "building-empire-state-building",
  "building-chrysler-building",
  "building-woolworth-building",
  "building-40-wall-street",
  "building-70-pine-street",
  "building-4-world-trade-center",
  "building-3-world-trade-center",
  "building-8-spruce-street",
  "building-bank-of-america-tower",
  "building-432-park-avenue",
  "building-111-west-57th-street",
  "building-220-central-park-south",
  "building-metlife-building",
];

const tx = client.transaction();
for (const id of deprecatedIds) {
  tx.delete(id);
}
for (const b of buildings) {
  const { id, nicknames, ...rest } = b;
  tx.createOrReplace({
    _id: `building-${id}`,
    _type: "building",
    ...rest,
    nicknames: nicknames?.length ? nicknames : undefined,
    slug: { _type: "slug", current: id },
  });
}
const result = await tx.commit();
console.log(`Seeded ${buildings.length} buildings.`, result.transactionId);
