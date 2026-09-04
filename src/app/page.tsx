import { SkylineExplorer } from "@/components/SkylineExplorer";
import { getBuildings } from "@/sanity/lib/buildings";

/** Revalidate so Studio publishes show up without a full redeploy */
export const revalidate = 30;

export default async function Home() {
  const buildings = await getBuildings();

  return (
    <div className="flex min-h-dvh flex-1 flex-col">
      <main className="flex min-h-dvh flex-1 flex-col">
        <SkylineExplorer buildings={buildings} />
      </main>
    </div>
  );
}
