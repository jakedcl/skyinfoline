import Link from "next/link";
import { SkylineExplorer } from "@/components/SkylineExplorer";
import { getBuildings } from "@/sanity/lib/buildings";

/** Revalidate so Studio publishes show up without a full redeploy */
export const revalidate = 30;

export default async function Home() {
  const buildings = await getBuildings();

  return (
    <div className="flex min-h-full flex-1 flex-col">
      <main className="sky-atmosphere flex flex-1 flex-col">
        <SkylineExplorer buildings={buildings} />
      </main>

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
