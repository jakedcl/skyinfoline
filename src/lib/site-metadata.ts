import type { Metadata } from "next";

export const siteOrigin = "https://skyinfoline.dcldev.com";
export const siteName = "SkyInfoLine";
export const homeTitle = "SkyInfoLine | New York City Building Atlas";
export const homeDescription = "Find New York City buildings by name, address or map, and explore the architecture and history behind them.";

const shareImage = {
  url: new URL("/nyc-skyline-from-brooklyn.jpg", siteOrigin),
  width: 1024,
  height: 809,
  alt: "Early twentieth-century New York skyline seen from Brooklyn",
};

export function pageMetadata(pathname: string, title: string, description: string): Metadata {
  const url = new URL(pathname, siteOrigin);
  const fullTitle = pathname === "/" ? title : `${title} | ${siteName}`;

  return {
    title: { absolute: fullTitle },
    description,
    alternates: { canonical: url },
    openGraph: { type: "website", siteName, title: fullTitle, description, url, images: [shareImage] },
    twitter: { card: "summary_large_image", title: fullTitle, description, images: [shareImage] },
  };
}
