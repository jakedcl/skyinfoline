import { createImageUrlBuilder } from "@sanity/image-url";
import type { SanityImageSource } from "@sanity/image-url";
import { dataset, projectId } from "@/sanity/env";

const builder = createImageUrlBuilder({ projectId, dataset });

/**
 * Build a CDN URL for a cutout. Force PNG so transparency is preserved
 * (Sanity may otherwise auto-convert to a lossy format).
 */
export function urlForCutout(source: SanityImageSource) {
  return builder.image(source).format("png").fit("max");
}
