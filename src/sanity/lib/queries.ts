import { defineQuery } from "next-sanity";

export const BUILDINGS_QUERY = defineQuery(`
  *[_type == "building" && defined(slug.current)] | order(orderIndex asc) {
    "id": slug.current,
    name,
    heightFt,
    floors,
    yearCompleted,
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
    cutout
  }
`);
