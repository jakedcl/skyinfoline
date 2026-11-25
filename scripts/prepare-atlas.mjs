import { mkdir, readFile, writeFile } from "node:fs/promises";
import { resolve } from "node:path";

const input = process.argv[2];
const destination = process.argv[3] ?? "atlas";
if (!input || resolve(input) === resolve(destination)) {
  throw new Error("Usage: node scripts/prepare-atlas.mjs PATH_TO_ATLAS_RELEASE [OUTPUT]");
}

async function readRows(directory, filename) {
  const document = await readFile(resolve(input, directory, filename), "utf8");
  return parseRows(document);
}

function parseRows(document) {
  return document.split("\n").filter(Boolean).map((line) => JSON.parse(line));
}

const [buildings, context, events, shapes, registry, enrichments, viewpoints] = await Promise.all([
  readRows("data", "buildings.jsonl"),
  readRows("data", "context-entities.jsonl"),
  readRows("data", "status-history.jsonl"),
  readRows("data", "building-geometry.jsonl"),
  readRows("research", "source-registry.jsonl"),
  readFile(new URL("../atlas/profile-enrichments.json", import.meta.url), "utf8").then(JSON.parse),
  readFile(new URL("../atlas/viewpoints.jsonl", import.meta.url), "utf8").then(parseRows),
]);

const limitedSources = new Set(["SKY-TEN", "CTBUH", "AIA-GUIDE"]);
const heldIdentityFlags = new Set(["possible_overlapping_lpc_identity", "lpc_action_scope_unresolved"]);
const sourceOfIdentity = new Set(["/canonical_name", "/significance", "/entity_type"]);

function isIndividualEvidence(claim) {
  return !limitedSources.has(claim.source_id);
}

const eligible = buildings.filter((building) =>
  building.borough &&
  building.significance?.reason &&
  !building.research.flags?.some((flag) => heldIdentityFlags.has(flag)) &&
  building.evidence.some((claim) => isIndividualEvidence(claim) && claim.paths?.some((field) => sourceOfIdentity.has(field))),
);

const neededContext = new Set(eligible.flatMap((building) =>
  (building.relationships ?? []).map((relationship) => relationship.target_id),
));
const includedContext = context.filter((entity) => neededContext.has(entity.id));
const ids = new Set([...eligible, ...includedContext].map((building) => building.id));

function publicBuilding(building) {
  const {
    id, canonical_name, aliases, borough, neighborhood, addresses, status, dates, era, spatial, measurements,
    architecture, use, people, chronology, records_and_firsts, cultural_history, fun_facts, visual_identifiers,
    viewing, relationships, significance, research, evidence, alternatives,
  } = building;
  const links = relationships?.filter((relationship) => ids.has(relationship.target_id));
  return {
    id, canonical_name, aliases, borough, neighborhood, addresses, status, dates, era, spatial, measurements,
    architecture, use, people, chronology, records_and_firsts, cultural_history, fun_facts, visual_identifiers,
    viewing, relationships: links?.length ? links : null, significance,
    research: { stage: research.stage },
    evidence: evidence.filter(isIndividualEvidence),
    alternatives: alternatives?.filter(isIndividualEvidence) ?? null,
  };
}

const projectedBuildings = eligible.map(publicBuilding);
const profiles = new Map(projectedBuildings.map((building) => [building.id, building]));
const noteFields = new Set(["cultural_history", "visual_identifiers", "fun_facts"]);
for (const { entity_id, field, text, evidence } of enrichments.claims) {
  const profile = profiles.get(entity_id);
  if (!profile || !noteFields.has(field) || !text?.trim() || !evidence?.source_id || !evidence.locator) {
    throw new Error(`Invalid profile claim for ${entity_id} at ${field}.`);
  }
  if (profile[field]?.includes(text)) {
    throw new Error(`Duplicate profile claim for ${entity_id} at ${field}.`);
  }
  const lines = profile[field] ??= [];
  profile.evidence.push({ ...evidence, paths: [`/${field}/${lines.length}`] });
  lines.push(text);
}
const projectedContext = includedContext.map(publicBuilding);
const projectedEvents = events.filter((event) => ids.has(event.entity_id) && !event.is_catalog_summary)
  .flatMap((event) => {
    const evidence = event.evidence.filter(isIndividualEvidence);
    return evidence.length ? [{
      entity_id: event.entity_id, status: event.status, event: event.event, date: event.date, date_role: event.date_role,
      is_catalog_summary: false, basis: event.basis, evidence,
    }] : [];
  });
const projectedShapes = shapes.filter((outline) =>
  ids.has(outline.entity_id) &&
  outline.evidence.some((claim) => claim.source_id === "OTI-FOOT" || claim.source_id === "OTI-FOOT-HIST"),
).map(({ entity_id, role, condition, geometry, evidence }) => ({ entity_id, role, condition, geometry, evidence }));

const viewpointRecords = viewpoints.flatMap((viewpoint) => [
  viewpoint, ...viewpoint.observations.flatMap((observation) => [observation, ...observation.targets]),
]);
const usedSources = new Set([...projectedBuildings, ...projectedContext, ...projectedEvents, ...projectedShapes, ...viewpointRecords].flatMap(
  (record) => [...record.evidence, ...(record.alternatives ?? [])].map((claim) => claim.source_id),
));
const projectedRegistry = [...registry, ...enrichments.sources].filter((source) => usedSources.has(source.source_id))
  .map(({ source_id, title, owner, url, reuse }) => ({ source_id, title, owner, url, reuse }));

if (projectedRegistry.length !== usedSources.size ||
    new Set(projectedRegistry.map((entry) => entry.source_id)).size !== usedSources.size) {
  throw new Error("The public source registry contains a missing or duplicate source ID.");
}

const data = new Map([
  ["buildings.jsonl", projectedBuildings], ["context-entities.jsonl", projectedContext],
  ["status-history.jsonl", projectedEvents], ["building-geometry.jsonl", projectedShapes],
  ["source-registry.jsonl", projectedRegistry],
]);

await mkdir(destination, { recursive: true });
await Promise.all([...data].map(([name, rows]) => {
  const document = rows.map((row) => JSON.stringify(row)).join("\n");
  return writeFile(resolve(destination, name), document ? document + "\n" : "");
}));
console.log(`Prepared ${projectedBuildings.length} building entries, ${projectedShapes.length} shapes, and ${projectedRegistry.length} sources.`);
