"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { BuildingDetail } from "@/components/BuildingDetail";
import { CinematicTimeline } from "@/components/CinematicTimeline";
import { Skyline } from "@/components/Skyline";
import { ViewpointSwitcher } from "@/components/ViewpointSwitcher";
import {
  findBuilding,
  isSkylineVisible,
  skylineNeighbors,
  yearRange,
} from "@/lib/buildings";
import { eraById, eraJumpYear, eraScrubBounds } from "@/lib/eras";
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
  const [eraFilterId, setEraFilterId] = useState<string | null>(null);

  const eraFilter = eraById(eraFilterId);

  const viewpoint = getViewpoint(viewpointId);

  const selected = findBuilding(buildings, selectedId);
  const { prevId, nextId } = useMemo(
    () =>
      skylineNeighbors(
        buildings,
        selectedId,
        scrubYear,
        viewpoint.sortDirection,
        eraFilter,
      ),
    [buildings, selectedId, scrubYear, viewpoint.sortDirection, eraFilter],
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
    if (selected && !isSkylineVisible(selected, scrubYear, eraFilter)) {
      setSelectedId(null);
    }
  }, [scrubYear, selected, eraFilter]);

  const handleScrubChange = useCallback(
    (year: number) => {
      if (eraFilterId) {
        setEraFilterId(null);
      }
      setScrubYear(Math.min(max, Math.max(min, year)));
    },
    [eraFilterId, min, max],
  );

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

  const handleEraSelect = (eraId: string | null) => {
    if (eraId === eraFilterId) {
      setEraFilterId(null);
      return;
    }
    const era = eraById(eraId);
    if (!era) return;
    setEraFilterId(era.id);
    const jump = eraJumpYear(era, max);
    const { min: eraMin, max: eraMax } = eraScrubBounds(era, min, max);
    setScrubYear(Math.min(eraMax, Math.max(eraMin, jump)));
  };

  return (
    <div className="flex w-full flex-col">
      <nav className="border-b border-white/10 px-4 py-2.5 sm:px-6">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3">
          <h1 className="text-base font-semibold tracking-tight text-white sm:text-lg">
            Skyinfoline
          </h1>
          <ViewpointSwitcher
            value={viewpointId}
            onChange={handleViewpointChange}
          />
        </div>
      </nav>

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
          eraFilter={eraFilter}
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
          eraFilterId={eraFilterId}
          onChange={handleScrubChange}
          onEraSelect={handleEraSelect}
        />
      </div>

      <BuildingDetail
        building={selected}
        onClose={() => setSelectedId(null)}
      />
    </div>
  );
}
