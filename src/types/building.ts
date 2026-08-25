export type BuildingStatus =
  | "completed"
  | "under-construction"
  | "demolished";

export type BuildingSilhouette = "rect" | "step" | "spire" | "art-deco";

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
  /** e.g. "/buildings/empire-state.png" — transparent PNG preferred */
  imageSrc?: string;
  /** Used when imageSrc is missing */
  silhouette?: BuildingSilhouette;
  shortBlurb?: string;
  wikipediaUrl?: string;
};
