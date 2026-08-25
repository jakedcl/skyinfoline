"use client";

import { useMemo, useState } from "react";
import { BuildingDetail } from "@/components/BuildingDetail";
import { Skyline } from "@/components/Skyline";
import { TimelineScrub } from "@/components/TimelineScrub";
import { findBuilding, yearRange } from "@/lib/buildings";
import type { Building } from "@/types/building";

type SkylineExplorerProps = {
  buildings: Building[];
};

export function SkylineExplorer({ buildings }: SkylineExplorerProps) {
  const { min, max } = useMemo(() => yearRange(buildings), [buildings]);
  const [scrubYear, setScrubYear] = useState(max);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [hoveredId, setHoveredId] = useState<string | null>(null);

  const selected = findBuilding(buildings, selectedId);

  return (
    <div className="flex w-full flex-col">
      <Skyline
        buildings={buildings}
        selectedId={selectedId}
        hoveredId={hoveredId}
        scrubYear={scrubYear}
        onSelect={setSelectedId}
        onHover={setHoveredId}
      />

      <div className="water-plane relative h-10 w-full" aria-hidden />

      <div className="border-t border-[var(--line)] bg-[var(--panel-deep)]/60 py-8">
        <TimelineScrub
          min={min}
          max={max}
          value={scrubYear}
          onChange={(year) => {
            setScrubYear(year);
            if (selected && selected.yearCompleted > year) {
              setSelectedId(null);
            }
          }}
        />
      </div>

      <BuildingDetail
        building={selected}
        onClose={() => setSelectedId(null)}
      />
    </div>
  );
}
