import { readFileSync } from "node:fs";
import path from "node:path";
import { displayAddress, showDate, statusGroups } from "./presentation";
import type {
  AtlasGeometry, AtlasMarkers, AtlasOutlines, Building, BuildingSummary, Evidence, Source, StatusEvent,
} from "./types";

function readRows<T>(file: string): T[] {
  const text = readFileSync(path.join(process.cwd(), "atlas", file), "utf8");
  return text.split("\n").filter(Boolean).map((line) => JSON.parse(line) as T);
}

function indexBy<T>(items: T[], key: (item: T) => string) {
  const grouped = new Map<string, T[]>();
  for (const item of items) {
    const id = key(item);
    const entries = grouped.get(id);
    if (entries) entries.push(item);
    else grouped.set(id, [item]);
  }
  return grouped;
}

const heldIdentityFlags = new Set(["possible_overlapping_lpc_identity", "lpc_action_scope_unresolved"]);
const catalog = readRows<Building>("buildings.jsonl");
const context = readRows<Building>("context-entities.jsonl");
const sources = new Map(readRows<Source>("source-registry.jsonl").map((source) => [source.source_id, source]));
const statusHistory = indexBy(readRows<StatusEvent>("status-history.jsonl"), (event) => event.entity_id);
let outlineIndex: Map<string, AtlasGeometry[]> | undefined;

export const publicBuildings = catalog.filter((record) =>
  record.borough &&
  record.significance?.reason &&
  record.evidence.some((claim) => sources.has(claim.source_id)) &&
  !record.research.flags?.some((flag) => heldIdentityFlags.has(flag)),
);

const buildingsById = new Map(publicBuildings.map((record) => [record.id, record]));
const linkTargets = new Map([...context, ...publicBuildings].map((record) => [record.id, record]));

if (new Set([...catalog, ...context].map((record) => record.id)).size !== catalog.length + context.length) {
  throw new Error("The atlas contains a duplicate canonical ID.");
}

const names = new Intl.Collator("en-US", { numeric: true });
const matchesAddress = new Map<string, string>([
  ["st", "street"], ["ave", "avenue"], ["av", "avenue"], ["rd", "road"], ["pl", "place"],
  ["blvd", "boulevard"], ["ct", "court"], ["hwy", "highway"], ["sq", "square"],
  ["ter", "terrace"], ["e", "east"], ["w", "west"], ["n", "north"], ["s", "south"],
]);

function normalize(value: string) {
  return value.normalize("NFKD").replace(/[\u0300-\u036f]/g, "").toLowerCase()
    .replaceAll("&", " and ").replace(/[’']/g, "")
    .replace(/[^a-z0-9]+/g, " ").trim();
}

function normalizeAddress(value: string) {
  return normalize(value).split(" ").map((word) => matchesAddress.get(word) ?? word).join(" ");
}

export function getBuilding(id: string) {
  return buildingsById.get(id);
}

function relatedAddress(building: Building) {
  const relationship = building.relationships?.find((item) => item.type === "replaced_by" && item.description);
  if (!relationship?.description) return null;
  const target = buildingsById.get(relationship.target_id);
  return target?.addresses?.find((address) =>
    normalize(relationship.description!).includes(normalize(address.text)),
  )?.text ?? null;
}

function summarize(building: Building, matchedAlias?: string): BuildingSummary {
  const address = building.addresses?.[0]?.text ?? relatedAddress(building);
  const date = building.dates?.opening ?? building.dates?.completion ?? building.dates?.construction;
  return {
    id: building.id,
    name: building.canonical_name,
    borough: building.borough,
    address: address ? displayAddress(address) : null,
    status: building.status?.value ?? "unknown",
    year: showDate(date),
    type: building.architecture?.building_type ?? null,
    alias: matchedAlias ?? null,
  };
}

const searchable = publicBuildings.map((record) => ({
  record,
  name: normalize(record.canonical_name),
  aliases: (record.aliases ?? []).map((alias) => ({ label: alias.name, text: normalize(alias.name) })),
  addresses: (record.addresses ?? []).map((address) => normalizeAddress(address.text)),
  relatedAddress: normalizeAddress(relatedAddress(record) ?? ""),
}));

type Searchable = typeof searchable[number];

function score(entry: Searchable, query: string, addressQuery: string) {
  if (!query) return { rank: 1, alias: undefined };
  const alias = entry.aliases.find((value) => value.text === query);
  if (entry.name === query || alias) return { rank: 7, alias: alias?.label };
  if (entry.addresses.includes(addressQuery)) return { rank: 6, alias: undefined };
  if (entry.relatedAddress === addressQuery) return { rank: 5, alias: undefined };
  const prefix = entry.aliases.find((value) => value.text.startsWith(query));
  if (entry.name.startsWith(query) || prefix || entry.addresses.some((value) => value.startsWith(addressQuery))) {
    return { rank: 4, alias: prefix?.label };
  }
  const substring = entry.aliases.find((value) => value.text.includes(query));
  if (entry.name.includes(query) || substring || entry.addresses.some((value) => value.includes(addressQuery))) {
    return { rank: 3, alias: substring?.label };
  }
  const haystack = [entry.name, ...entry.aliases.map((value) => value.text), ...entry.addresses].join(" ");
  const tokens = addressQuery.split(" ");
  return { rank: tokens.every((token) => haystack.includes(token)) ? 2 : 0, alias: undefined };
}

const tierRank: Record<string, number> = { iconic: 4, significant: 3, locally_significant: 2 };
const stageRank: Record<string, number> = { profiled: 3, curated_candidate: 2, source_indexed: 1 };

function compareBuildings(a: Building, b: Building) {
  return (tierRank[b.significance.tier] ?? 0) - (tierRank[a.significance.tier] ?? 0) ||
    (stageRank[b.research.stage] ?? 0) - (stageRank[a.research.stage] ?? 0) ||
    names.compare(a.canonical_name, b.canonical_name);
}

export type SearchFilters = { q: string; borough: string; status: string; era: string; type: string };

export const availableTypes = Array.from(new Set(publicBuildings.flatMap((building) =>
  building.architecture?.building_type ? [building.architecture.building_type] : [],
))).sort(names.compare);

export function searchBuildings(filters: SearchFilters) {
  const query = normalize(filters.q);
  const addressQuery = normalizeAddress(filters.q);
  const statusFilter = statusGroups[filters.status as keyof typeof statusGroups] as readonly string[] | undefined;

  return searchable.flatMap((entry) => {
    const { record } = entry;
    if (filters.borough && filters.borough !== record.borough) return [];
    if (filters.era && filters.era !== record.era) return [];
    if (filters.type && filters.type !== record.architecture?.building_type) return [];
    if (statusFilter && !statusFilter.includes(record.status?.value ?? "unknown")) return [];
    const match = score(entry, query, addressQuery);
    return match.rank ? [{ record, ...match }] : [];
  }).sort((a, b) => b.rank - a.rank || compareBuildings(a.record, b.record));
}

export function searchResults(matches: ReturnType<typeof searchBuildings>) {
  return matches.map(({ record, alias }) => summarize(record, alias));
}

export function markersFor(records: Building[]): AtlasMarkers {
  return {
    type: "FeatureCollection",
    features: records.flatMap((record) => {
      const { point } = getLocation(record);
      if (!point || !Number.isFinite(point.lon) || !Number.isFinite(point.lat)) return [];
      return [{
        type: "Feature",
        id: record.id,
        geometry: { type: "Point", coordinates: [point.lon, point.lat] },
        properties: { id: record.id, name: record.canonical_name, status: record.status?.value ?? "unknown" },
      }];
    }),
  };
}

function shapesFor(id: string) {
  outlineIndex ??= indexBy(readRows<AtlasGeometry>("building-geometry.jsonl"), (shape) => shape.entity_id);
  const shapes = outlineIndex.get(id)?.filter((item) => item.role === "mapped_outline") ?? [];
  const current = shapes.filter((item) => item.condition === "current_source");
  return current.length ? current : shapes;
}

export function getLocation(record: Building) {
  const shapes = shapesFor(record.id);
  const isArchived = shapes[0]?.condition === "historic_source";
  const point = record.spatial?.point ?? (isArchived ? pointFromArchive(shapes[0]) : null);
  return { point, isArchived, evidence: shapes.flatMap((shape) => shape.evidence) };
}

function pointFromArchive(outline: AtlasGeometry) {
  const vertices = outline.geometry.type === "MultiPolygon"
    ? outline.geometry.coordinates.flat(2)
    : outline.geometry.coordinates.flat();
  if (!vertices.length) return null;
  const longitudes = vertices.map(([lon]) => lon);
  const latitudes = vertices.map(([, lat]) => lat);
  return {
    lon: (Math.min(...longitudes) + Math.max(...longitudes)) / 2,
    lat: (Math.min(...latitudes) + Math.max(...latitudes)) / 2,
    method: "archived_outline_center",
    accuracy_m: null,
  };
}

export function getOutlines(id: string): AtlasOutlines | undefined {
  const shapes = shapesFor(id);
  if (!shapes.length) return undefined;
  return {
    type: "FeatureCollection",
    features: shapes.map((shape) => ({ type: "Feature", geometry: shape.geometry, properties: {} })),
  };
}

export function relatedBuildings(record: Building) {
  return (record.relationships ?? []).flatMap((relation, index) => {
    const target = linkTargets.get(relation.target_id);
    if (!target) return [];
    return [{ relation, target, index, link: buildingsById.has(target.id) }];
  });
}

export function getStatusEvents(id: string) {
  return (statusHistory.get(id) ?? []).filter((event) => !event.is_catalog_summary);
}

export function sourceLink(sourceId: string, url?: string | null) {
  const source = sources.get(sourceId);
  const address = url ?? source?.url;
  if (!address || !/^https?:\/\//i.test(address)) return null;
  return { href: address, label: source?.title ?? sourceId, owner: source?.owner };
}

export function citationsFor(record: Building, field: string) {
  return record.evidence.filter((claim) =>
    claim.paths?.some((claimPath) =>
      claimPath === field || claimPath.startsWith(field + "/") || field.startsWith(claimPath + "/"),
    ),
  );
}

export function uniqueReferences(evidence: Evidence[]) {
  const links = new Map<string, NonNullable<ReturnType<typeof sourceLink>> & { locators: string[] }>();

  for (const claim of evidence) {
    const link = sourceLink(claim.source_id, claim.url);
    if (!link) continue;
    const existing = links.get(link.href);
    if (!existing) links.set(link.href, { ...link, locators: claim.locator ? [claim.locator] : [] });
    else if (claim.locator && !existing.locators.includes(claim.locator)) existing.locators.push(claim.locator);
  }

  return [...links.values()];
}

const featuredNames = [
  "56 Leonard Street", "Pennsylvania Station, original headhouse",
  "120th Police Precinct Station House", "Pieter Claesen Wyckoff House",
  "TWA Flight Center headhouse", "Yankee Stadium, original",
];

export const featuredBuildings = featuredNames.flatMap((name) => {
  const record = publicBuildings.find((building) => building.canonical_name === name);
  return record ? [summarize(record)] : [];
});

export const boroughCounts = new Map(
  [...indexBy(publicBuildings, (record) => record.borough)].map(([borough, records]) => [borough, records.length]),
);
