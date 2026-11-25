import type { MetadataRoute } from "next";
import { publicBuildings } from "@/lib/catalog";
import { buildingPath } from "@/lib/presentation";
import { siteOrigin } from "@/lib/site-metadata";

export default function sitemap(): MetadataRoute.Sitemap {
  const pages = ["/", "/explore", "/lower-manhattan-3d", "/skyline", "/privacy", "/accessibility"];
  const buildingPages = publicBuildings.map(({ id }) => buildingPath(id));

  return [...pages, ...buildingPages].map((pathname) => ({ url: new URL(pathname, siteOrigin).href }));
}
