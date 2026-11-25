import type { Metadata } from "next";
import Link from "next/link";
import { ChevronLeft, ExternalLink, MapPin } from "lucide-react";
import { notFound } from "next/navigation";
import { BuildingPhotoGallery } from "@/components/building-photo-gallery";
import { BuildingPhotoFigure } from "@/components/building-photos";
import { StatusLabel } from "@/components/building-row";
import { MapPanel } from "@/components/map-panel";
import {
  citationsFor, getBuilding, getBuildingPhotos, getLocation, getOutlines, getStatusEvents, markersFor,
  relatedBuildings, sourceLink, uniqueReferences,
} from "@/lib/catalog";
import { backLinkFor, buildingPath, displayAddress, humanize, isHistorical, showDate } from "@/lib/presentation";
import { pageMetadata } from "@/lib/site-metadata";
import type { Building, Evidence } from "@/lib/types";

type PageProps = {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ back?: string | string[] }>;
};

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params;
  const building = getBuilding(id);
  if (!building) return { title: "Building not found" };

  const summary = building.research.stage !== "source_indexed" && building.significance.reason
    ? building.significance.reason
    : "Explore available architectural details, dates, and sources in the SkyInfoLine atlas.";
  const description = `${building.canonical_name}, ${building.borough}. ${summary}`;

  return pageMetadata(buildingPath(id), building.canonical_name, description);
}

type Fact = { label: string; text: string; paths: string[] };

function fact(label: string, text: string | null | undefined, ...paths: string[]): Fact[] {
  return text ? [{ label, text, paths }] : [];
}

function CitationLinks({ claims }: { claims: Evidence[] }) {
  const links = uniqueReferences(claims);
  if (!links.length) return null;
  return (
    <span className="citation-links">
      {links.map((link) => <a key={link.href} href={link.href} title={link.label}>{link.owner ?? link.label}</a>)}
    </span>
  );
}

function EntryFacts({ building }: { building: Building }) {
  const dateLabels: Record<string, string> = {
    construction: "Construction", start: "Started", completion: "Completed", opening: "Opened",
    demolition: "Demolished", destruction: "Destroyed", proposal: "Proposed",
  };
  const heightLabels: Record<string, string> = {
    reported: "Reported height", architectural: "Architectural height", roof: "Mapped roof height",
    tip: "Tip height", occupied: "Highest occupied floor", lantern_top: "Height to lantern top",
  };
  const facts = [
    ...Object.entries(dateLabels).flatMap(([name, label]) => fact(label, showDate(building.dates?.[name]), `/dates/${name}`)),
    ...fact("Building type", building.architecture?.building_type, "/architecture/building_type"),
    ...fact("Style", building.architecture?.styles?.join(", "), "/architecture/styles"),
    ...fact("Materials", building.architecture?.materials?.join(", "), "/architecture/materials"),
    ...fact("Structural systems", building.architecture?.structural_systems?.join(", "), "/architecture/structural_systems"),
    ...fact("Original use", building.use?.original?.join(", "), "/use/original"),
    ...fact("Current use", building.use?.current?.join(", "), "/use/current"),
    ...(building.people ?? []).flatMap((person, index) =>
      fact(person.role === "architect_or_builder_as_recorded" ? "Architect or builder (as recorded)" : humanize(person.role), person.name, `/people/${index}`),
    ),
    ...(building.measurements?.heights ?? []).flatMap((height, index) => {
      if (!heightLabels[height.type]) return [];
      const label = heightLabels[height.type] + (height.condition === "proposed" ? " (proposed)" : "");
      return fact(label, `${height.value.toLocaleString("en-US")} ${height.unit}`, `/measurements/heights/${index}`);
    }),
    ...(building.measurements?.floor_counts ?? []).flatMap((count, index) =>
      fact(count.type === "agency_reported" ? "Agency-reported floors" : "Floor count", `${count.value}${count.condition === "proposed" ? " proposed" : ""}`, `/measurements/floor_counts/${index}`),
    ),
  ];

  if (!facts.length) return null;
  return (
    <section className="entry-section" aria-labelledby="facts-title">
      <h2 id="facts-title">Building facts</h2>
      <dl className="fact-list">
        {facts.map(({ label, text, paths }) => (
          <div key={paths.join("|")}>
            <dt>{label}</dt>
            <dd>{text}<CitationLinks claims={paths.flatMap((field) => citationsFor(building, field))} /></dd>
          </div>
        ))}
      </dl>
    </section>
  );
}

function EntryNotes({ building }: { building: Building }) {
  const topics = [
    { title: "History", field: "/cultural_history", lines: building.cultural_history },
    { title: "What to look for", field: "/visual_identifiers", lines: building.visual_identifiers },
    { title: "Design details", field: "/architecture/design_features", lines: building.architecture?.design_features },
    { title: "Engineering", field: "/architecture/engineering_features", lines: building.architecture?.engineering_features },
    { title: "Notable details", field: "/fun_facts", lines: building.fun_facts },
    { title: "Records and firsts", field: "/records_and_firsts", lines: building.records_and_firsts },
  ];
  return topics.map(({ title, field, lines }) => lines?.length ? (
    <section className="entry-section" key={field}>
      <h2>{title}</h2>
      {lines.map((text, index) => (
        <div className="entry-note" key={index}>
          <p>{text}</p>
          <CitationLinks claims={citationsFor(building, `${field}/${index}`)} />
        </div>
      ))}
    </section>
  ) : null);
}

function EntryTimeline({ building }: { building: Building }) {
  const timeline = (building.chronology ?? []).map((event, index) => ({
    date: event.date, text: event.description, key: `chronology-${index}`, claims: citationsFor(building, `/chronology/${index}`),
  }));
  const noteKey = (date: string | null | undefined, text: string) => `${date}|${text}`;
  const listed = new Set(timeline.map((item) => noteKey(item.date?.start, item.text)));
  const related = getStatusEvents(building.id).flatMap((event, index) => {
    const text = event.basis ?? humanize(event.event);
    if (listed.has(noteKey(event.date?.start, text)) ||
        timeline.some((item) => item.date?.start && item.date.start === event.date?.start)) return [];
    return [{ date: event.date, text, key: `status-${index}`, claims: event.evidence }];
  });
  const items = [...timeline, ...related].sort((a, b) => (a.date?.start ?? "9999").localeCompare(b.date?.start ?? "9999"));

  if (!items.length) return null;
  return (
    <section className="entry-section">
      <h2>Timeline</h2>
      <ol className="timeline">
        {items.map(({ date, text, claims, key }) => (
          <li key={key}>
            <span className="timeline-date">{showDate(date) ?? "Date unverified"}</span>
            <div><p>{text}</p><CitationLinks claims={claims} /></div>
          </li>
        ))}
      </ol>
    </section>
  );
}

function EntrySources({ building, locationEvidence }: { building: Building; locationEvidence: Evidence[] }) {
  const statusClaims = getStatusEvents(building.id).flatMap(({ evidence }) => evidence);
  const links = uniqueReferences([...building.evidence, ...statusClaims, ...locationEvidence]);
  const alternatives = (building.alternatives ?? []).filter((item) => item.reason_for_preference);
  return (
    <section className="entry-section source-section" id="sources">
      <h2>Sources</h2>
      {alternatives.length > 0 && (
        <details className="source-notes">
          <summary>Conflicting source values</summary>
          {alternatives.map((item, index) => {
            const link = sourceLink(item.source_id);
            return (
              <div key={index}>
                <p>{item.reason_for_preference}</p>
                {link && <a href={link.href}>{link.label}</a>}
              </div>
            );
          })}
        </details>
      )}
      <ul className="source-list">
        {links.map((item) => (
          <li key={item.href}>
            <a href={item.href}>{item.label} <ExternalLink size={13} aria-hidden="true" /></a>
            {item.owner && <div>{item.owner}</div>}
            {item.locators.length > 0 && <details><summary>Source references</summary><p>{item.locators.join(" · ")}</p></details>}
          </li>
        ))}
      </ul>
    </section>
  );
}

export default async function BuildingPage({ params, searchParams }: PageProps) {
  const { id } = await params;
  const building = getBuilding(id);
  if (!building) notFound();

  const { back } = await searchParams;
  const backTarget = backLinkFor(back);
  const backHref = backTarget.href;
  const address = building.addresses?.[0]?.text;
  const status = building.status?.value ?? "unknown";
  const statusDate = showDate(building.status?.as_of);
  const { point, isArchived, evidence: locationEvidence } = getLocation(building);
  const historical = isHistorical(status);
  const relations = relatedBuildings(building);
  const [leadPhoto, ...galleryPhotos] = getBuildingPhotos(id);
  const description = building.research.stage !== "source_indexed" && building.significance.reason;

  return (
    <article className="frame entry-page">
      <Link className="back-link" href={backHref}><ChevronLeft size={18} aria-hidden="true" /> {backTarget.label}</Link>
      <header className="entry-header">
        <Link className="eyebrow" href={`/explore?borough=${encodeURIComponent(building.borough)}`}>{building.borough}</Link>
        <h1>{building.canonical_name}</h1>
        {building.aliases?.length ? <p className="entry-aliases">Also known as {building.aliases.map((alias) => alias.name).join(" · ")}</p> : null}
        <div className="entry-meta">
          <StatusLabel status={status} />
          {statusDate && <span>As of {statusDate}</span>}
          {address && <span className="entry-address"><MapPin size={15} aria-hidden="true" />{displayAddress(address)}</span>}
          {galleryPhotos.length > 0 && <a href="#photos">Photos</a>}
          <a href="#sources">Sources</a>
        </div>
      </header>

      <div className={`entry-grid${leadPhoto ? " has-photos" : ""}`}>
        {(description || leadPhoto) && (
          <div className="entry-lead">
            {description && (
              <div className="entry-deck">
                <p>{description}</p>
                <CitationLinks claims={citationsFor(building, "/significance")} />
              </div>
            )}
            {leadPhoto && (
              <section className="entry-photos" aria-label="Lead photograph">
                <BuildingPhotoFigure photo={leadPhoto} />
              </section>
            )}
          </div>
        )}
        {(point || !!building.viewing?.length) && (
          <aside className="entry-aside">
            <div className="location-card">
              <h2>{historical ? "Historical location" : "Location"}</h2>
              {point && (
                <>
                  <MapPanel detail markers={markersFor([building])} outlines={getOutlines(building.id)} />
                  <p className="map-caption">{isArchived ? "Archived city footprint shown against a present-day basemap." :
                    historical ? "Historical site shown against a present-day basemap." :
                    point.method === "point_on_oti_footprint" ? "Location matched to a city building footprint." : "Location is approximate."}</p>
                  {point.accuracy_m && <p className="map-caption">Estimated accuracy {point.accuracy_m.toLocaleString("en-US")} m.</p>}
                  <CitationLinks claims={[...citationsFor(building, "/spatial"), ...locationEvidence]} />
                </>
              )}
              {building.viewing?.map((text, index) => (
                <div className="entry-note" key={index}>
                  <p>{text}</p><CitationLinks claims={citationsFor(building, `/viewing/${index}`)} />
                </div>
              ))}
            </div>
          </aside>
        )}
        <div className="entry-main">
          <EntryFacts building={building} />
          <EntryNotes building={building} />
          <EntryTimeline building={building} />
          {relations.length > 0 && (
            <section className="entry-section">
              <h2>Related buildings and sites</h2>
              <ul className="related-list">
                {relations.map(({ relation, target, index, link }) => (
                  <li key={index}>
                    <span className="label">{humanize(relation.type)}</span>
                    {link ? <Link href={buildingPath(target.id, backHref)}>{target.canonical_name}</Link> : <strong>{target.canonical_name}</strong>}
                    {relation.description && <p>{relation.description}</p>}
                    <CitationLinks claims={citationsFor(building, `/relationships/${index}`)} />
                  </li>
                ))}
              </ul>
            </section>
          )}
          {galleryPhotos.length > 0 && <BuildingPhotoGallery photos={galleryPhotos} />}
          <EntrySources building={building} locationEvidence={locationEvidence} />
        </div>
      </div>
    </article>
  );
}
