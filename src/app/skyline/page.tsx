import { notFound } from "next/navigation";
import { SkylinePhoto } from "@/components/skyline-photo";
import { getSkyline } from "@/lib/catalog";
import { showDate } from "@/lib/presentation";
import { pageMetadata } from "@/lib/site-metadata";

export const metadata = pageMetadata(
  "/skyline",
  "Lower Manhattan skyline from Brooklyn",
  "Identify the towers in an early twentieth-century photograph of Lower Manhattan, and open each building’s page.",
);

export default async function SkylinePage({ searchParams }: { searchParams: Promise<{ building?: string | string[] }> }) {
  const skyline = getSkyline();
  if (!skyline) notFound();
  const { building } = await searchParams;
  const { viewpoint, observation, media, targets } = skyline;
  const date = showDate(observation.captured_on);

  return (
    <div className="frame skyline-page">
      <p className="eyebrow">Skyline photo</p>
      <h1>Lower Manhattan from Brooklyn</h1>
      <p className="district-intro">
        {targets.length} towers in this view across the East River are matched to atlas entries. Select one to see how it was identified and open its page.
      </p>
      <SkylinePhoto
        src="/nyc-skyline-from-brooklyn.jpg"
        width={1024}
        height={809}
        alt="Early twentieth-century Lower Manhattan skyline seen across the East River from the Brooklyn waterfront"
        targets={targets}
        initialId={typeof building === "string" ? building : null}
      />
      <section className="district-notes" aria-labelledby="skyline-notes-title">
        <h2 id="skyline-notes-title">About this photograph</h2>
        <ul>
          <li>
            <strong>{media.title}</strong>{media.creator ? `, ${media.creator}` : ""}{date ? `, ${date}` : ""}. <a href={media.item_url}>Library of Congress</a>, Prints &amp; Photographs Division, Detroit Publishing Company Collection. {media.rights}
          </li>
          {observation.notes && <li>{observation.notes}</li>}
          <li>{viewpoint.location_description}</li>
          <li>
            The buildings were identified by hand from their silhouettes. A likely match fits the shape and expected direction but hasn’t been confirmed by a source.
          </li>
        </ul>
      </section>
    </div>
  );
}
