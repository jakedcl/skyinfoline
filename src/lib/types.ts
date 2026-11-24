import type { FeatureCollection, MultiPolygon, Point, Polygon } from "geojson";

export type AtlasDate = {
  start: string | null;
  end: string | null;
  precision: string;
  approximate: boolean;
};

export type Evidence = {
  source_id: string;
  locator: string | null;
  url: string | null;
  source_date: string | null;
  accessed_on: string | null;
  paths?: string[];
};

export type Source = {
  source_id: string;
  title: string;
  owner: string;
  url: string;
};

export type AtlasPoint = {
  lon: number;
  lat: number;
  method: string;
  accuracy_m: number | null;
  as_of: string | null;
};

export type AtlasGeometry = {
  entity_id: string;
  geometry: MultiPolygon | Polygon;
  condition: string;
  role: string;
  evidence: Evidence[];
};

export type TimelineEvent = { type: string; date: AtlasDate | null; description: string };
export type StatusEvent = {
  entity_id: string;
  status: string;
  event: string;
  date: AtlasDate | null;
  date_role: string;
  is_catalog_summary: boolean;
  basis: string | null;
  evidence: Evidence[];
};

export type Relationship = { type: string; target_id: string; description: string | null };

export type Building = {
  id: string;
  canonical_name: string;
  aliases: { name: string; kind: string }[] | null;
  borough: string;
  neighborhood: string | null;
  addresses: { text: string; kind: string }[] | null;
  status: { value: string; as_of: AtlasDate | null; basis: string | null } | null;
  dates: Record<string, AtlasDate | null>;
  era: string | null;
  spatial: { point: AtlasPoint | null } | null;
  measurements: {
    heights: { type: string; value: number; unit: string; reference: string | null; condition: string }[] | null;
    floor_counts: { type: string; value: number; condition: string; note: string | null }[] | null;
  } | null;
  architecture: {
    building_type: string | null;
    styles: string[] | null;
    materials: string[] | null;
    structural_systems: string[] | null;
    design_features: string[] | null;
    engineering_features: string[] | null;
  } | null;
  use: { original: string[] | null; current: string[] | null; as_of: AtlasDate | null } | null;
  people: { name: string; role: string }[] | null;
  chronology: TimelineEvent[] | null;
  records_and_firsts: string[] | null;
  cultural_history: string[] | null;
  fun_facts: string[] | null;
  visual_identifiers: string[] | null;
  viewing: string[] | null;
  relationships: Relationship[] | null;
  significance: { tier: string; tags: string[] | null; reason: string };
  research: { stage: string; flags: string[] | null };
  evidence: Evidence[];
  alternatives: { path: string; value: unknown; source_id: string; locator: string | null; reason_for_preference: string | null }[] | null;
};

export type BuildingSummary = {
  id: string;
  name: string;
  borough: string;
  address: string | null;
  status: string;
  year: string | null;
  type: string | null;
  alias: string | null;
};

export type MapMarker = { id: string; name: string; status: string };
export type AtlasMarkers = FeatureCollection<Point, MapMarker>;
export type AtlasOutlines = FeatureCollection<Polygon | MultiPolygon>;
