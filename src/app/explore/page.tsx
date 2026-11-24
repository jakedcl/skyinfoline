import type { Metadata } from "next";
import Link from "next/link";
import { List, Map, Search } from "lucide-react";
import { BuildingRow } from "@/components/building-row";
import { MapPanel } from "@/components/map-panel";
import { availableTypes, markersFor, searchBuildings, searchResults } from "@/lib/catalog";
import { boroughs, eraNames, explorePath, statusGroupNames } from "@/lib/presentation";

export const metadata: Metadata = { title: "Explore the atlas" };

type Params = Record<string, string | string[] | undefined>;

function read(params: Params, key: string) {
  const value = params[key];
  return typeof value === "string" ? value.trim().slice(0, 160) : "";
}

const pageSize = 24;

export default async function ExplorePage({ searchParams }: { searchParams: Promise<Params> }) {
  const params = await searchParams;
  const borough = read(params, "borough");
  const status = read(params, "status");
  const era = read(params, "era");
  const type = read(params, "type");
  const filters = {
    q: read(params, "q"),
    borough: boroughs.some((value) => value === borough) ? borough : "",
    status: Object.hasOwn(statusGroupNames, status) ? status : "",
    era: Object.hasOwn(eraNames, era) ? era : "",
    type: availableTypes.includes(type) ? type : "",
  };
  const view = read(params, "view") === "map" ? "map" : "";
  const matches = searchBuildings(filters);
  const pages = Math.max(1, Math.ceil(matches.length / pageSize));
  const requestedPage = Number(read(params, "page"));
  const page = Number.isSafeInteger(requestedPage) ? Math.min(pages, Math.max(1, requestedPage)) : 1;
  const localPath = explorePath({ ...filters, view, page: page > 1 && !view ? String(page) : "" });
  const markers = view ? markersFor(matches.map(({ record }) => record)) : null;
  const results = searchResults(matches.slice((page - 1) * pageSize, page * pageSize));
  const hasFilters = Object.values(filters).some(Boolean);

  return (
    <div className="frame explore-page">
      <h1>Explore the atlas</h1>
      <form className="filter-form" action="/explore" aria-label="Search and filter buildings">
        {view && <input type="hidden" name="view" value={view} />}
        <div className="explore-search">
          <label className="sr-only" htmlFor="explore-query">Building name, alias, or address</label>
          <Search className="search-icon" size={19} aria-hidden="true" />
          <input id="explore-query" name="q" type="search" defaultValue={filters.q} placeholder="Building name, alias, or address" autoComplete="off" />
        </div>
        <label>Borough
          <select name="borough" defaultValue={filters.borough}>
            <option value="">All boroughs</option>
            {boroughs.map((value) => <option key={value}>{value}</option>)}
          </select>
        </label>
        <label>Status
          <select name="status" defaultValue={filters.status}>
            <option value="">All statuses</option>
            {Object.entries(statusGroupNames).map(([value, name]) => <option key={value} value={value}>{name}</option>)}
          </select>
        </label>
        <label>Era
          <select name="era" defaultValue={filters.era}>
            <option value="">All eras</option>
            {Object.entries(eraNames).map(([value, name]) => <option key={value} value={value}>{name}</option>)}
          </select>
        </label>
        <label>Building type
          <select name="type" defaultValue={filters.type}>
            <option value="">All types</option>
            {availableTypes.map((value) => <option key={value}>{value}</option>)}
          </select>
        </label>
        <button className="button-accent" type="submit">Search</button>
      </form>

      <div className="result-toolbar">
        <div className="result-count">
          <strong>{matches.length.toLocaleString("en-US")} {matches.length === 1 ? "building" : "buildings"}</strong>
          {markers && <span>{markers.features.length.toLocaleString("en-US")} mapped</span>}
          {hasFilters && <Link href={explorePath({ view })}>Clear filters</Link>}
        </div>
        <nav className="view-toggle" aria-label="Results view">
          <Link aria-current={view ? undefined : "page"} href={explorePath(filters)}><List size={16} aria-hidden="true" /> List</Link>
          <Link aria-current={view ? "page" : undefined} href={explorePath({ ...filters, view: "map" })}><Map size={16} aria-hidden="true" /> Map</Link>
        </nav>
      </div>

      {!matches.length && (
        <div className="empty-state">
          <h2>No matching buildings</h2>
          <p>Try a shorter name, a street address, or fewer filters.</p>
        </div>
      )}

      {markers && markers.features.length > 0 && <MapPanel key={localPath} markers={markers} back={localPath} />}
      {markers && !markers.features.length && matches.length > 0 && (
        <div className="empty-state">
          <h2>No mapped locations in these results</h2>
          <Link className="text-link" href={explorePath(filters)}>See the list</Link>
        </div>
      )}

      {!view && results.length > 0 && (
        <div className="building-list">
          <h2 className="sr-only">Search results</h2>
          {results.map((building) => <BuildingRow key={building.id} building={building} back={localPath} />)}
        </div>
      )}
      {!view && pages > 1 && (
        <nav className="pagination" aria-label="Results pages">
          {page > 1 ? <Link href={explorePath({ ...filters, page: String(page - 1) })}>Previous</Link> : <span />}
          <span>Page {page} of {pages}</span>
          {page < pages ? <Link href={explorePath({ ...filters, page: String(page + 1) })}>Next</Link> : <span />}
        </nav>
      )}
    </div>
  );
}
