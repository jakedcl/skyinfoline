import Link from "next/link";
import { District3D } from "@/components/district-3d";
import { districtBoundary, lowerManhattanDistrict } from "@/lib/district";
import { pageMetadata } from "@/lib/site-metadata";

export const metadata = pageMetadata(
  "/lower-manhattan-3d",
  "Lower Manhattan in 3D",
  "Explore atlas buildings in Lower Manhattan as approximate 3D shapes built from City outlines and roof heights.",
);

export default async function LowerManhattan3DPage({ searchParams }: { searchParams: Promise<{ building?: string | string[] }> }) {
  const { building } = await searchParams;
  const { buildings, shapes } = lowerManhattanDistrict();

  return (
    <div className="frame district-page">
      <p className="eyebrow">3D pilot</p>
      <h1>Lower Manhattan in 3D</h1>
      <p className="district-intro">
        Atlas buildings south of Chambers Street and the Brooklyn Bridge, raised to their mapped roof heights. Select a building in the view or the list to open its page.
      </p>
      <District3D
        buildings={buildings}
        shapes={shapes}
        boundary={districtBoundary}
        initialId={typeof building === "string" ? building : null}
      />
      <section className="district-notes" aria-labelledby="district-notes-title">
        <h2 id="district-notes-title">How to read this view</h2>
        <ul>
          <li>
            <strong>Red shapes are atlas buildings.</strong> Each is a City building outline viewed from above, raised to the City’s mapped roof height. They’re approximate massing, so setbacks, crowns and spires aren’t modeled. A tower on a wide base, like the Woolworth Building, appears as one solid block. One World Trade Center stops at its roof, not its spire.
          </li>
          <li>
            <strong>Gray shapes are surrounding buildings</strong> from OpenStreetMap, included for orientation only. Their heights aren’t reviewed.
          </li>
          <li>
            Outlines and roof heights come from the <a href="https://data.cityofnewyork.us/d/5zhs-2jue">NYC building footprints</a> dataset published by the NYC Office of Technology and Innovation. Each building page lists its own sources.
          </li>
        </ul>
        <p><Link className="text-link" href="/explore?view=map&borough=Manhattan">Open the flat map</Link></p>
      </section>
    </div>
  );
}
