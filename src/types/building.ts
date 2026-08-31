export type BuildingStatus =
  | "completed"
  | "under-construction"
  | "demolished";

export type BuildingSilhouette = "rect" | "step" | "spire" | "art-deco";

/** Manhattan skyline zone — for grouping/filtering, not GPS */
export type SkylineCluster =
  | "downtown"
  | "midtown"
  | "midtown-east"
  | "billionaires-row"
  | "hudson-yards"
  | "upper-west"
  | "brooklyn";

export type Building = {
  id: string;
  name: string;
  heightFt: number;
  floors?: number;
  yearCompleted: number;
  architect?: string;
  status: BuildingStatus;
  /** Skyline position: lower = south = left */
  orderIndex: number;
  neighborhood?: string;
  /** Skyline zone (Downtown, Hudson Yards, …) */
  cluster?: SkylineCluster;
  /** Architectural style label, e.g. "Art Deco" */
  style?: string;
  /** Alternate / former names */
  nicknames?: string[];
  /**
   * Cultural / skyline weight 1–10 (not shown as a number in the UI).
   * Higher = stronger visual presence on the skyline.
   */
  skylineImportance?: number;
  /** e.g. "/buildings/empire-state.png" — transparent PNG preferred */
  imageSrc?: string;
  /** Used when imageSrc is missing */
  silhouette?: BuildingSilhouette;
  shortBlurb?: string;
  wikipediaUrl?: string;
};

export const CLUSTER_LABELS: Record<SkylineCluster, string> = {
  downtown: "Downtown",
  midtown: "Midtown",
  "midtown-east": "Midtown East",
  "billionaires-row": "Billionaires' Row",
  "hudson-yards": "Hudson Yards",
  "upper-west": "Upper West Side",
  brooklyn: "Brooklyn",
};
