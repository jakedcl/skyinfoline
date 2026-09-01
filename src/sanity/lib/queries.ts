import { defineQuery } from "next-sanity";

export const BUILDINGS_QUERY = defineQuery(`
  *[_type == "building" && defined(slug.current)] | order(orderIndex desc) {
    "id": slug.current,
    name,
    heightFt,
    floors,
    yearCompleted,
    yearDemolished,
    architect,
    status,
    orderIndex,
    neighborhood,
    cluster,
    style,
    nicknames,
    skylineImportance,
    silhouette,
    shortBlurb,
    wikipediaUrl,
    cutout,
    "cutoutAspect": select(
      defined(cutout.asset->metadata.dimensions) =>
        cutout.asset->metadata.dimensions.width / cutout.asset->metadata.dimensions.height,
      null
    )
  }
`);
