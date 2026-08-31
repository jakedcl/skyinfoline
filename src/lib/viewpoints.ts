export type ViewpointId =
  | "jersey-city"
  | "brooklyn-bridge"
  | "staten-island"
  | "central-park";

export type SortDirection = "asc" | "desc";

export type Viewpoint = {
  id: ViewpointId;
  label: string;
  /** Short compass line, e.g. "looking east" */
  heading: string;
  /** Sort orderIndex: desc = north on left (Jersey City), asc = south on left (Brooklyn) */
  sortDirection: SortDirection;
  leftLabel: string;
  rightLabel: string;
  /** CSS class on the sky atmosphere wrapper */
  atmosphereClass: string;
};

export const VIEWPOINTS: Viewpoint[] = [
  {
    id: "jersey-city",
    label: "Jersey City",
    heading: "looking east",
    sortDirection: "desc",
    leftLabel: "North",
    rightLabel: "South",
    atmosphereClass: "view-jersey-city",
  },
  {
    id: "brooklyn-bridge",
    label: "Brooklyn Bridge",
    heading: "looking west",
    sortDirection: "asc",
    leftLabel: "South",
    rightLabel: "North",
    atmosphereClass: "view-brooklyn-bridge",
  },
  {
    id: "staten-island",
    label: "Staten Island Ferry",
    heading: "looking north",
    sortDirection: "desc",
    leftLabel: "West",
    rightLabel: "East",
    atmosphereClass: "view-staten-island",
  },
  {
    id: "central-park",
    label: "Central Park",
    heading: "looking south",
    sortDirection: "asc",
    leftLabel: "West",
    rightLabel: "East",
    atmosphereClass: "view-central-park",
  },
];

export const DEFAULT_VIEWPOINT = VIEWPOINTS[0];

export function getViewpoint(id: ViewpointId): Viewpoint {
  return VIEWPOINTS.find((v) => v.id === id) ?? DEFAULT_VIEWPOINT;
}
