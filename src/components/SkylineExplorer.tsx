"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { BuildingDetail } from "@/components/BuildingDetail";
import { CinematicTimeline } from "@/components/CinematicTimeline";
import { Skyline } from "@/components/Skyline";
import { ViewpointSwitcher } from "@/components/ViewpointSwitcher";
import {
  findBuilding,
  isVisibleAtYear,
  skylineNeighbors,
  yearRange,
} from "@/lib/buildings";
import { getViewpoint, type ViewpointId } from "@/lib/viewpoints";
import type { Building } from "@/types/building";

type SkylineExplorerProps = {
  buildings: Building[];
};

export function SkylineExplorer({ buildings }: SkylineExplorerProps) {
  const { min, max } = useMemo(() => yearRange(buildings), [buildings]);
  const [scrubYear, setScrubYear] = useState(max);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const [viewpointId, setViewpointId] = useState<ViewpointId>("jersey-city");
  const [prevScrubYear, setPrevScrubYear] = useState(max);

  const viewpoint = getViewpoint(viewpointId);

  const selected = findBuilding(buildings, selectedId);
  const { prevId, nextId } = useMemo(
    () =>
      skylineNeighbors(
        buildings,
        selectedId,
        scrubYear,
        viewpoint.sortDirection,
      ),
    [buildings, selectedId, scrubYear, viewpoint.sortDirection],
  );

  // Track buildings that just completed this scrub year (for entrance flash)
  const newlyBuiltIds = useMemo(() => {
    const ids = new Set<string>();
    if (scrubYear > prevScrubYear) {
      for (const b of buildings) {
        if (b.yearCompleted > prevScrubYear && b.yearCompleted <= scrubYear) {
          ids.add(b.id);
        }
      }
    }
    return ids;
  }, [buildings, scrubYear, prevScrubYear]);

  useEffect(() => {
    if (selected && !isVisibleAtYear(selected, scrubYear)) {
      setSelectedId(null);
    }
  }, [scrubYear, selected]);

  const handleScrubChange = useCallback((year: number) => {
    setScrubYear(year);
  }, []);

  useEffect(() => {
    setPrevScrubYear(scrubYear);
  }, [scrubYear]);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement | null;
      if (
        target &&
        (target.tagName === "INPUT" ||
          target.tagName === "TEXTAREA" ||
          target.tagName === "SELECT" ||
          target.isContentEditable)
      ) {
        return;
      }

      if (event.key === "ArrowLeft" && prevId) {
        event.preventDefault();
        setSelectedId(prevId);
      } else if (event.key === "ArrowRight" && nextId) {
        event.preventDefault();
        setSelectedId(nextId);
      } else if (event.key === "Escape" && selectedId) {
        setSelectedId(null);
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [prevId, nextId, selectedId]);

  const handleViewpointChange = (id: ViewpointId) => {
    setViewpointId(id);
    setSelectedId(null);
  };

  return (
    <div className="flex w-full flex-col">
      <div className="mb-6">
        <ViewpointSwitcher value={viewpointId} onChange={handleViewpointChange} />
      </div>

      <div
        className={[
          "viewpoint-atmosphere transition-[filter] duration-700",
          viewpoint.atmosphereClass,
        ].join(" ")}
      >
        <div className="mb-2 flex justify-between px-8 text-[10px] tracking-[0.2em] text-[var(--horizon)]/60 uppercase">
          <span>← {viewpoint.leftLabel}</span>
          <span>{viewpoint.rightLabel} →</span>
        </div>

        <Skyline
          buildings={buildings}
          selectedId={selectedId}
          hoveredId={hoveredId}
          scrubYear={scrubYear}
          sortDirection={viewpoint.sortDirection}
          viewpointLabel={`${viewpoint.label}, ${viewpoint.heading}`}
          newlyBuiltIds={newlyBuiltIds}
          onSelect={setSelectedId}
          onHover={setHoveredId}
        />
      </div>

      <div className="water-plane relative h-10 w-full" aria-hidden />

      <div className="border-t border-[var(--line)] bg-[var(--panel-deep)]/60 py-10">
        <CinematicTimeline
          min={min}
          max={max}
          value={scrubYear}
          onChange={handleScrubChange}
        />
      </div>

      <BuildingDetail
        building={selected}
        onClose={() => setSelectedId(null)}
      />
    </div>
  );
}
