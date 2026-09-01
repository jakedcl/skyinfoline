import {
  existsSync,
  readdirSync,
  readFileSync,
} from "node:fs";
import { fileURLToPath } from "node:url";
import { basename, dirname, extname, join } from "node:path";
import { createClient } from "next-sanity";

const __dirname = dirname(fileURLToPath(import.meta.url));
const buildings = JSON.parse(
  readFileSync(join(__dirname, "../src/data/buildings-seed.json"), "utf8"),
);

/** Folders checked for transparent PNG cutouts (first match wins). */
const CUTOUT_DIR_CANDIDATES = [
  join(__dirname, "../building-cutouts"),
  join(__dirname, "../public/building-cutouts"),
  join(__dirname, "../outputs/building-cutouts"),
];

const FILENAME_MAP_PATH = join(__dirname, "../building-cutouts/filename-map.json");

/** Load optional descriptive-filename → building-id map. */
function loadFilenameMap() {
  if (!existsSync(FILENAME_MAP_PATH)) return new Map();
  const raw = JSON.parse(readFileSync(FILENAME_MAP_PATH, "utf8"));
  return new Map(Object.entries(raw));
}

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
const buildingIdSet = new Set(ids);
const buildingNameById = Object.fromEntries(buildings.map((b) => [b.id, b.name]));

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

function resolveCutoutsDir() {
  for (const dir of CUTOUT_DIR_CANDIDATES) {
    if (existsSync(dir)) return dir;
  }
  return null;
}

/**
 * Map seed id -> absolute path for each PNG.
 * Accepts `{id}.png` or descriptive names listed in building-cutouts/filename-map.json.
 */
function scanLocalCutouts(dir, filenameMap) {
  const mapped = new Map();
  const unmapped = [];

  if (!dir) return { mapped, unmapped };

  const pngFiles = readdirSync(dir).filter(
    (f) => extname(f).toLowerCase() === ".png",
  );

  for (const filename of pngFiles) {
    const slug = basename(filename, ".png");
    const filePath = join(dir, filename);
    const buildingId = buildingIdSet.has(slug)
      ? slug
      : filenameMap.get(slug);
    if (buildingId && buildingIdSet.has(buildingId)) {
      mapped.set(buildingId, filePath);
    } else {
      unmapped.push(filename);
    }
  }

  return { mapped, unmapped };
}

async function uploadCutout(filePath, filename, buildingName) {
  const buffer = readFileSync(filePath);
  const asset = await client.assets.upload("image", buffer, {
    filename,
    contentType: "image/png",
  });
  return {
    _type: "image",
    asset: { _type: "reference", _ref: asset._id },
    alt: buildingName,
  };
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

const filenameMap = loadFilenameMap();
const cutoutsDir = resolveCutoutsDir();
const { mapped: localCutoutPaths, unmapped: unmappedFiles } = scanLocalCutouts(
  cutoutsDir,
  filenameMap,
);

if (cutoutsDir) {
  console.log(`Cutouts folder: ${cutoutsDir}`);
  console.log(`Found ${localCutoutPaths.size} PNG(s) mapped to building ids.`);
} else {
  console.log(
    "No cutouts folder found. Drop transparent PNGs in building-cutouts/ (see building-cutouts/README.md).",
  );
}

if (unmappedFiles.length) {
  console.warn(
    "Unmapped PNG filenames (no matching building id):",
    unmappedFiles.join(", "),
  );
}

const missingCutouts = ids.filter((id) => !localCutoutPaths.has(id));
if (localCutoutPaths.size > 0 && missingCutouts.length) {
  console.log(
    `${missingCutouts.length} building(s) have no local PNG:`,
    missingCutouts.join(", "),
  );
}

// Preserve cutouts already in Sanity when no local PNG replaces them.
const existingDocs = await client.fetch(
  `*[_type == "building"]{ _id, cutout, name, "slug": slug.current }`,
);
const preservedCutouts = new Map(
  existingDocs.map((doc) => [doc._id, doc.cutout]),
);

const orphanIds = existingDocs
  .filter((doc) => !canonicalIds.has(doc._id))
  .map((doc) => doc._id);

const idsToDelete = [...new Set([...legacyDeprecatedIds, ...orphanIds])];

if (orphanIds.length) {
  console.log(
    "Removing orphan building documents:",
    orphanIds.map((id) => {
      const doc = existingDocs.find((d) => d._id === id);
      return `${id} (${doc?.name ?? "?"}, slug: ${doc?.slug ?? "?"})`;
    }),
  );
}

/** Upload local PNGs and build cutout image objects keyed by building id. */
const uploadedCutouts = new Map();
let uploadFailures = 0;

for (const [buildingId, filePath] of localCutoutPaths) {
  const filename = `${buildingId}.png`;
  try {
    const cutout = await uploadCutout(
      filePath,
      filename,
      buildingNameById[buildingId],
    );
    uploadedCutouts.set(buildingId, cutout);
    console.log(`Uploaded cutout: ${filename}`);
  } catch (error) {
    uploadFailures += 1;
    console.error(`Failed to upload ${filename}:`, error);
  }
}

const tx = client.transaction();
for (const id of idsToDelete) {
  tx.delete(id);
}
for (const b of buildings) {
  const { id, nicknames, ...rest } = b;
  const docId = `building-${id}`;
  const cutout =
    uploadedCutouts.get(id) ?? preservedCutouts.get(docId) ?? undefined;

  const doc = {
    _id: docId,
    _type: "building",
    ...rest,
    nicknames: nicknames?.length ? nicknames : undefined,
    slug: { _type: "slug", current: id },
  };
  if (cutout) doc.cutout = cutout;

  tx.createOrReplace(doc);
}
const result = await tx.commit();

const attachedCount = buildings.filter((b) => {
  const docId = `building-${b.id}`;
  return uploadedCutouts.has(b.id) || preservedCutouts.get(docId)?.asset;
}).length;

console.log(
  `Seeded ${buildings.length} buildings (deleted ${idsToDelete.length} deprecated/orphan docs).`,
  result.transactionId,
);
console.log(
  `Cutouts: ${uploadedCutouts.size} uploaded, ${attachedCount}/${buildings.length} buildings have a cutout attached.`,
);
if (uploadFailures) {
  console.warn(`${uploadFailures} cutout upload(s) failed.`);
}
