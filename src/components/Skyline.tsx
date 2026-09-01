"use client";

import Image from "next/image";
import { useLayoutEffect, useMemo, useRef, useState } from "react";
import {
  BuildingSilhouetteShape,
  silhouetteAspect,
} from "@/components/BuildingSilhouette";
import type { Building } from "@/types/building";
import type { Era } from "@/lib/eras";
import {
  buildingsVisibleInSkyline,
  isSkylineVisible,
  maxHeight,
  sortedByOrder,
} from "@/lib/buildings";
import type { SortDirection } from "@/lib/viewpoints";
import { importancePresence } from "@/lib/importance";

const SKYLINE_MAX_PX = 320;
const BASE_MAX_WIDTH_PX = 48;
const MIN_WIDTH_PX = 16;
const HIT_PAD_X = 4;
const GAP_PX = 4;
const LABEL_RESERVE_PX = 72;
const SKYLINE_EASE = "cubic-bezier(0.22, 1, 0.36, 1)";
const SKYLINE_TRANSITION_MS = 550;

type SkylineProps = {
  buildings: Building[];
  selectedId: string | null;
  hoveredId: string | null;
  scrubYear: number;
  eraFilter?: Era | null;
  sortDirection?: SortDirection;
  viewpointLabel?: string;
  newlyBuiltIds?: Set<string>;
  onSelect: (id: string) => void;
  onHover: (id: string | null) => void;
};

/** Fewer visible towers → wider silhouettes so early eras feel monumental */
function sparseWidthCap(visibleCount: number): number {
  if (visibleCount <= 0) return BASE_MAX_WIDTH_PX;
  return Math.min(160, BASE_MAX_WIDTH_PX * Math.sqrt(24 / visibleCount));
}

function towerSize(
  building: Building,
  tallest: number,
  maxWidthPx: number,
  measuredAspect?: number,
): { heightPx: number; widthPx: number } {
  const heightPx = Math.max(
    28,
    (building.heightFt / tallest) * SKYLINE_MAX_PX,
  );

  const hasCutout = Boolean(building.imageSrc);
  const aspect =
    measuredAspect ??
    building.cutoutAspect ??
    silhouetteAspect(building.silhouette ?? "rect");

  const naturalWidth = heightPx * aspect;

  // PNG cutouts: height is sacred (accurate ft ratio). Width follows image aspect —
  // never squeeze height via a width cap + object-contain letterboxing.
  if (hasCutout) {
    return {
      heightPx,
      widthPx: Math.max(MIN_WIDTH_PX, naturalWidth),
    };
  }

  return {
    heightPx,
    widthPx: Math.min(maxWidthPx, Math.max(MIN_WIDTH_PX, naturalWidth)),
  };
}

export function Skyline({
  buildings,
  selectedId,
  hoveredId,
  scrubYear,
  eraFilter = null,
  sortDirection = "desc",
  viewpointLabel = "Manhattan skyline",
  newlyBuiltIds,
  onSelect,
  onHover,
}: SkylineProps) {
  const ordered = sortedByOrder(buildings, sortDirection);
  const visible = useMemo(
    () => buildingsVisibleInSkyline(ordered, scrubYear, eraFilter),
    [ordered, scrubYear, eraFilter],
  );
  const visibleCount = visible.length;
  const tallest = maxHeight(visible) || maxHeight(buildings) || 1;
  const maxWidthPx = sparseWidthCap(visibleCount);

  const scrollerRef = useRef<HTMLDivElement>(null);
  const rowRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);
  const [contentWidth, setContentWidth] = useState(0);
  const [measuredAspects, setMeasuredAspects] = useState<
    Record<string, number>
  >({});

  useLayoutEffect(() => {
    const scroller = scrollerRef.current;
    const row = rowRef.current;
    if (!scroller || !row) return;

    const update = () => {
      const available = scroller.clientWidth - 24;
      const prev = row.style.transform;
      row.style.transform = "none";
      const content = row.scrollWidth;
      row.style.transform = prev;
      if (content <= 0 || available <= 0) return;
      setContentWidth(content);
      setScale(Math.min(1, available / content));
    };

    update();
    const ro = new ResizeObserver(update);
    ro.observe(scroller);
    ro.observe(row);
    return () => ro.disconnect();
  }, [ordered.length, scrubYear, eraFilter, visibleCount, maxWidthPx]);

  const rowHeight = (SKYLINE_MAX_PX + 48 + LABEL_RESERVE_PX) * scale;
  const scaledWidth = contentWidth > 0 ? contentWidth * scale : undefined;
  const transition = `width ${SKYLINE_TRANSITION_MS}ms ${SKYLINE_EASE}, height ${SKYLINE_TRANSITION_MS}ms ${SKYLINE_EASE}, opacity ${SKYLINE_TRANSITION_MS}ms ${SKYLINE_EASE}, padding ${SKYLINE_TRANSITION_MS}ms ${SKYLINE_EASE}, transform ${SKYLINE_TRANSITION_MS}ms ${SKYLINE_EASE}`;

  return (
    <div
      ref={scrollerRef}
      className="skyline-scroll relative w-full overflow-x-auto"
    >
      <div
        className="mx-auto overflow-visible"
        style={{
          width: scaledWidth,
          height: rowHeight + 8,
          maxWidth: "100%",
          transition: `width ${SKYLINE_TRANSITION_MS}ms ${SKYLINE_EASE}, height ${SKYLINE_TRANSITION_MS}ms ${SKYLINE_EASE}`,
        }}
      >
        <div
          ref={rowRef}
          className="relative flex origin-top-left items-end justify-center pb-0 pt-20"
          style={{
            gap: GAP_PX,
            minHeight: SKYLINE_MAX_PX + 48 + LABEL_RESERVE_PX,
            transform: `scale(${scale})`,
            width: contentWidth || "max-content",
            transition: `transform ${SKYLINE_TRANSITION_MS}ms ${SKYLINE_EASE}`,
          }}
          aria-label={`${viewpointLabel}, towers along Manhattan`}
        >
          {ordered.map((building) => {
            const built = isSkylineVisible(building, scrubYear, eraFilter);
            const justBuilt = newlyBuiltIds?.has(building.id) ?? false;
            const { heightPx, widthPx } = built
              ? towerSize(
                  building,
                  tallest,
                  maxWidthPx,
                  measuredAspects[building.id],
                )
              : { heightPx: 0, widthPx: 0 };
            const selected = selectedId === building.id;
            const hovered = hoveredId === building.id;
            const presence = importancePresence(building.skylineImportance);
            const slotWidth = built ? widthPx + HIT_PAD_X * 2 : 0;

            return (
              <button
                key={building.id}
                type="button"
                aria-pressed={built ? selected : undefined}
                aria-hidden={!built}
                tabIndex={built ? 0 : -1}
                aria-label={`${building.name}, ${building.heightFt} feet, completed ${building.yearCompleted}`}
                onClick={() => built && onSelect(building.id)}
                onMouseEnter={() => built && onHover(building.id)}
                onMouseLeave={() => onHover(null)}
                onFocus={() => built && onHover(building.id)}
                onBlur={() => onHover(null)}
                className={[
                  "group relative flex shrink-0 flex-col items-center overflow-visible outline-none",
                  built ? "cursor-pointer" : "pointer-events-none",
                  selected || hovered ? "-translate-y-1.5" : "translate-y-0",
                  justBuilt ? "building-entrance" : "",
                ].join(" ")}
                style={{
                  width: slotWidth,
                  paddingInline: built ? HIT_PAD_X : 0,
                  opacity: built ? (selected || hovered ? 1 : presence) : 0,
                  transition,
                }}
              >
                <span
                  className={[
                    "relative block shrink-0",
                    selected
                      ? "text-[var(--accent)]"
                      : hovered
                        ? "text-[var(--steel-bright)]"
                        : "text-[var(--steel)]",
                    selected
                      ? "drop-shadow-[0_0_12px_rgba(232,168,56,0.35)]"
                      : "",
                  ].join(" ")}
                  style={{
                    height: heightPx,
                    width: widthPx,
                    transition: `height ${SKYLINE_TRANSITION_MS}ms ${SKYLINE_EASE}, width ${SKYLINE_TRANSITION_MS}ms ${SKYLINE_EASE}, color 300ms, filter 300ms`,
                  }}
                >
                  <span
                    className={[
                      "skyline-label",
                      built && (selected || hovered)
                        ? "opacity-100 text-[var(--accent)]"
                        : "opacity-0 text-[var(--horizon)]/70 group-focus-visible:opacity-100",
                    ].join(" ")}
                  >
                    {building.name}
                  </span>

                  {building.imageSrc ? (
                    <Image
                      src={building.imageSrc}
                      alt=""
                      width={widthPx > 0 ? widthPx * 2 : 96}
                      height={heightPx > 0 ? heightPx * 2 : 128}
                      className="block h-full w-full"
                      style={{ objectFit: "fill" }}
                      unoptimized
                      onLoad={(event) => {
                        const img = event.currentTarget;
                        if (!img.naturalWidth || !img.naturalHeight) return;
                        const aspect = img.naturalWidth / img.naturalHeight;
                        setMeasuredAspects((prev) =>
                          prev[building.id] === aspect
                            ? prev
                            : { ...prev, [building.id]: aspect },
                        );
                      }}
                    />
                  ) : (
                    <BuildingSilhouetteShape
                      type={building.silhouette ?? "rect"}
                      className="h-full w-full"
                      title={building.name}
                    />
                  )}

                  {selected && built ? (
                    <span
                      aria-hidden
                      className="absolute -bottom-1 left-1/2 h-0.5 w-3/4 -translate-x-1/2 rounded-full bg-[var(--accent)]"
                    />
                  ) : null}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
