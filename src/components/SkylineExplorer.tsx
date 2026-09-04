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
import { selectLandingBuildings } from "@/lib/landingSet";
import { SKYLINE_MOBILE_MAX_WIDTH_PX } from "@/lib/skyline-layout";
import { getViewpoint, type ViewpointId } from "@/lib/viewpoints";
import type { Building } from "@/types/building";

type SkylineExplorerProps = {
  buildings: Building[];
};

/**
 * SSR + first client paint must share one width so landing N / tower text match.
 * Real viewport is applied only after mount (useEffect) — never in useState init.
 */
const LANDING_SSR_WIDTH_PX = 390;

/** Viewport width for landing density; hydrated value only after mount. */
function useViewportWidth(): number {
  const [width, setWidth] = useState(LANDING_SSR_WIDTH_PX);

  useEffect(() => {
    const sync = () => setWidth(window.innerWidth);
    sync();
    window.addEventListener("resize", sync);
    return () => window.removeEventListener("resize", sync);
  }, []);

  return width;
}

export function SkylineExplorer({ buildings }: SkylineExplorerProps) {
  const { min, max } = useMemo(() => yearRange(buildings), [buildings]);
  const [scrubYear, setScrubYear] = useState(max);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const [viewpointId, setViewpointId] = useState<ViewpointId>("jersey-city");
  const [prevScrubYear, setPrevScrubYear] = useState(max);
  const [eraFilterId, setEraFilterId] = useState<string | null>(null);
  const [hasInteracted, setHasInteracted] = useState(false);
  const viewportWidth = useViewportWidth();

  const eraFilter = eraById(eraFilterId);
  const skipYearCheck = !hasInteracted;
  /** Pre-interaction: tallest-by-height subset sized to viewport width. */
  const isLanding = !hasInteracted;

  const skylineBuildings = useMemo(
    () =>
      isLanding
        ? selectLandingBuildings(buildings, viewportWidth)
        : buildings,
    [buildings, isLanding, viewportWidth],
  );

  const viewpoint = getViewpoint(viewpointId);

  const selected = findBuilding(buildings, selectedId);
  const { prevId, nextId } = useMemo(
    () =>
      skylineNeighbors(
        skylineBuildings,
        selectedId,
        scrubYear,
        viewpoint.sortDirection,
        eraFilter,
        skipYearCheck,
      ),
    [
      skylineBuildings,
      selectedId,
      scrubYear,
      viewpoint.sortDirection,
      eraFilter,
      skipYearCheck,
    ],
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
    if (
      selected &&
      !isSkylineVisible(selected, scrubYear, eraFilter, skipYearCheck)
    ) {
      setSelectedId(null);
      return;
    }
    if (
      selected &&
      isLanding &&
      !skylineBuildings.some((b) => b.id === selected.id)
    ) {
      setSelectedId(null);
    }
  }, [
    scrubYear,
    selected,
    eraFilter,
    skipYearCheck,
    isLanding,
    skylineBuildings,
  ]);

  const handleScrubChange = useCallback(
    (year: number) => {
      setHasInteracted(true);
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
    setHasInteracted(true);
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
      <nav className="relative z-20 border-b border-white/10 bg-[var(--sky-top)]/85 px-4 py-2.5 backdrop-blur-sm sm:px-6">
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

      <div className="skyline-hero">
        <div className="skyline-hero__bg" aria-hidden />

        <div
          className={[
            "viewpoint-atmosphere relative z-10 transition-[filter] duration-700",
            viewpoint.atmosphereClass,
          ].join(" ")}
        >
          <div className="mb-1 flex justify-between px-4 text-[10px] tracking-[0.2em] text-white/70 uppercase drop-shadow-sm sm:mb-2 sm:px-8">
            <span>← {viewpoint.leftLabel}</span>
            <span>{viewpoint.rightLabel} →</span>
          </div>

          <Skyline
            buildings={skylineBuildings}
            selectedId={selectedId}
            hoveredId={hoveredId}
            scrubYear={scrubYear}
            eraFilter={eraFilter}
            skipYearCheck={skipYearCheck}
            sortDirection={viewpoint.sortDirection}
            viewpointLabel={`${viewpoint.label}, ${viewpoint.heading}`}
            newlyBuiltIds={newlyBuiltIds}
            forceFitWidth={
              isLanding || viewportWidth < SKYLINE_MOBILE_MAX_WIDTH_PX
            }
            onSelect={setSelectedId}
            onHover={setHoveredId}
          />
        </div>

        <div className="water-plane relative z-10 h-10 w-full" aria-hidden />
      </div>

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
