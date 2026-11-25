import type { AtlasDate } from "./types";

export const boroughs = ["Manhattan", "Brooklyn", "Queens", "Bronx", "Staten Island"] as const;

export const eraNames: Record<string, string> = {
  dutch_colonial: "Dutch New Amsterdam",
  english_colonial_revolution: "English colonial and Revolutionary",
  early_republic: "Early republic",
  industrial_city: "Industrial city",
  early_high_rise: "Early high-rises",
  pre_zoning_boom: "Pre-1916 building boom",
  setback_and_art_deco: "Setbacks and Art Deco",
  postwar_modern: "Postwar modern",
  late_20th_century: "Late 20th century",
  early_21st_century: "Early 21st century",
  recent_21st_century: "Recent 21st century",
  future_project: "Future projects",
};

export const statusGroups = {
  standing: ["standing"],
  lost: ["demolished", "destroyed", "lost_unspecified"],
  projects: ["under_construction", "planned_approved", "planned_proposed", "planned_announced", "unbuilt"],
  other: ["unknown", "ruins"],
} as const;

export const statusGroupNames = {
  standing: "Standing",
  lost: "Demolished or destroyed",
  projects: "Projects and proposals",
  other: "Other or unknown",
};

const statusNames: Record<string, string> = {
  standing: "Standing",
  demolished: "Demolished",
  destroyed: "Destroyed",
  lost_unspecified: "No longer standing",
  under_construction: "Under construction",
  planned_approved: "Approved",
  planned_proposed: "Proposed",
  planned_announced: "Announced",
  unbuilt: "Unbuilt",
  ruins: "Surviving ruins",
  unknown: "Status unverified",
};

export function statusLabel(status: string) {
  return statusNames[status] ?? humanize(status);
}

export function statusTone(status: string) {
  if (status === "standing") return "standing";
  if ((statusGroups.lost as readonly string[]).includes(status)) return "lost";
  if ((statusGroups.projects as readonly string[]).includes(status)) return "projects";
  return "other";
}

export function humanize(value: string) {
  const text = value.replaceAll("_", " ");
  return text.charAt(0).toUpperCase() + text.slice(1);
}

export function displayAddress(text: string) {
  if (text !== text.toUpperCase()) return text;
  return text.toLowerCase().replace(/(?:^|[\s/-])[a-z]/g, (letter) => letter.toUpperCase());
}

const longDate = new Intl.DateTimeFormat("en-US", {
  month: "long", year: "numeric", day: "numeric", timeZone: "UTC",
});
const monthDate = new Intl.DateTimeFormat("en-US", {
  month: "long", year: "numeric", timeZone: "UTC",
});

function formatDatePart(value: string) {
  if (/^\d{4}-\d{2}-\d{2}$/.test(value)) return longDate.format(new Date(value));
  if (/^\d{4}-\d{2}$/.test(value)) return monthDate.format(new Date(value + "-01"));
  return value;
}

export function showDate(value: AtlasDate | null | undefined): string | null {
  if (!value?.start && !value?.end) return null;
  const leading = value.approximate ? "c. " : "";
  if (!value.start) return "By " + leading + formatDatePart(value.end!);
  const first = formatDatePart(value.start);
  if (value.end && value.end !== value.start) return leading + first + "–" + formatDatePart(value.end);
  return leading + first;
}

export function isHistorical(status: string) {
  return (statusGroups.lost as readonly string[]).includes(status);
}

export function explorePath(input: Record<string, string> = {}) {
  const supported = Object.entries(input).filter(([, value]) => value);
  const query = new URLSearchParams(supported).toString();
  return "/explore" + (query ? "?" + query : "");
}

export function buildingPath(id: string, back?: string) {
  const query = back ? "?" + new URLSearchParams({ back }).toString() : "";
  return "/buildings/" + id + query;
}

const backDestinations = [
  { pattern: /^\/explore(?:\?|$)/, label: "Back to explore" },
  { pattern: /^\/lower-manhattan-3d(?:\?|$)/, label: "Back to the 3D view" },
  { pattern: /^\/skyline(?:\?|$)/, label: "Back to the skyline photo" },
];

export function backLinkFor(back: string | string[] | undefined) {
  const value = typeof back === "string" ? back : "";
  const match = backDestinations.find(({ pattern }) => pattern.test(value));
  return match ? { href: value, label: match.label } : { href: "/explore", label: "Back to explore" };
}
