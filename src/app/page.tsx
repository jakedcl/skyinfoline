import Link from "next/link";
import { SkylineExplorer } from "@/components/SkylineExplorer";
import { getBuildings } from "@/sanity/lib/buildings";

/** Revalidate so Studio publishes show up without a full redeploy */
export const revalidate = 30;

export default async function Home() {
  const buildings = await getBuildings();

  return (
    <div className="flex min-h-full flex-1 flex-col">
      <header className="sky-atmosphere relative overflow-hidden pt-10 pb-2 text-[var(--horizon)] md:pt-14">
        <div className="pointer-events-none absolute inset-0 opacity-40 [background-image:radial-gradient(rgba(255,255,255,0.06)_1px,transparent_1px)] [background-size:18px_18px]" />

        <div className="relative z-10 mx-auto max-w-6xl px-6">
          <p className="animate-brand-in text-xs tracking-[0.35em] text-[var(--accent)] uppercase">
            Interactive Manhattan skyline
          </p>
          <h1 className="animate-brand-in mt-3 text-5xl font-semibold tracking-tight text-white md:text-7xl">
            Skyinfoline
          </h1>
          <p className="animate-brand-in-delay mt-4 max-w-lg text-base leading-relaxed text-[var(--horizon)]/85 md:text-lg">
            Jersey City or Brooklyn Bridge—same towers, two directions.
            Scrub through history and click a silhouette to explore.
          </p>
        </div>

        <div className="relative z-10 mt-10 md:mt-14">
          <SkylineExplorer buildings={buildings} />
        </div>
      </header>

      <footer className="mt-auto border-t border-[var(--line)] bg-[var(--panel)] px-6 py-6 text-sm text-[var(--ink-muted)]">
        <div className="mx-auto flex max-w-6xl flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <p>
            Edit buildings in{" "}
            <Link
              href="/studio"
              className="text-[var(--ink-soft)] underline-offset-4 hover:text-[var(--accent)] hover:underline"
            >
              /studio
            </Link>{" "}
            or{" "}
            <a
              href="https://skyinfoline.sanity.studio/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[var(--ink-soft)] underline-offset-4 hover:text-[var(--accent)] hover:underline"
            >
              skyinfoline.sanity.studio
            </a>
            . Transparent PNG cutouts upload there.
          </p>
          <p className="text-xs tracking-wide uppercase">Skyinfoline · NYC v1</p>
        </div>
      </footer>
    </div>
  );
}

