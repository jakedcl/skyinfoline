import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { createClient } from "next-sanity";

const __dirname = dirname(fileURLToPath(import.meta.url));
const buildings = JSON.parse(
  readFileSync(join(__dirname, "../src/data/buildings-seed.json"), "utf8"),
);

// --- Validate local seed data (fail fast on duplicates) ---
const ids = buildings.map((b) => b.id);
const names = buildings.map((b) => b.name);
const dupIds = ids.filter((id, i) => ids.indexOf(id) !== i);
const dupNames = names.filter((name, i) => names.indexOf(name) !== i);
if (dupIds.length) {
  throw new Error(`Duplicate ids in buildings-seed.json: ${[...new Set(dupIds)].join(", ")}`);
}
if (dupNames.length) {
  throw new Error(
    `Duplicate names in buildings-seed.json: ${[...new Set(dupNames)].join(", ")}`,
  );
}

const canonicalIds = new Set(ids.map((id) => `building-${id}`));

const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET || "production",
  apiVersion: "2025-08-25",
  token: process.env.SANITY_WRITE_TOKEN,
  useCdn: false,
});

if (!process.env.SANITY_WRITE_TOKEN) {
  throw new Error("SANITY_WRITE_TOKEN is required to seed buildings.");
}

/** Known legacy document IDs from earlier seed passes (slug renames, etc.). */
const legacyDeprecatedIds = [
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
  // slug renames (canonical ids kept in seed)
  "building-flatiron",
  "building-thirty-hudson-yards",
  "building-270-park",
];

// Find any building docs in Sanity that are not in the canonical seed set.
const existing = await client.fetch(
  `*[_type == "building"]{ _id, name, "slug": slug.current }`,
);
const orphanIds = existing
  .filter((doc) => !canonicalIds.has(doc._id))
  .map((doc) => doc._id);

const idsToDelete = [...new Set([...legacyDeprecatedIds, ...orphanIds])];

if (orphanIds.length) {
  console.log(
    "Removing orphan building documents:",
    orphanIds.map((id) => {
      const doc = existing.find((d) => d._id === id);
      return `${id} (${doc?.name ?? "?"}, slug: ${doc?.slug ?? "?"})`;
    }),
  );
}

const tx = client.transaction();
for (const id of idsToDelete) {
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
console.log(
  `Seeded ${buildings.length} buildings (deleted ${idsToDelete.length} deprecated/orphan docs).`,
  result.transactionId,
);
