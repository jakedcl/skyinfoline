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
import {
  SKYLINE_HOVER_SCALE,
  SKYLINE_MAX_PX,
  SKYLINE_MOBILE_MAX_WIDTH_PX,
  SKYLINE_SCROLL_PAD_PX,
  skylineFitScale,
  skylineMaxPxForViewport,
  skylinePadTopPx,
  skylineRowHeightPx,
} from "@/lib/skyline-layout";
import type { SortDirection } from "@/lib/viewpoints";
import { SkylineHeightScale } from "@/components/SkylineHeightScale";

const BASE_MAX_WIDTH_PX = 48;
const MIN_WIDTH_PX = 16;
const HIT_PAD_X = 4;
const GAP_PX = 4;
const SKYLINE_EASE = "cubic-bezier(0.22, 1, 0.36, 1)";
const SKYLINE_TRANSITION_MS = 550;
/** Faux-3D lift — base contact shadow stays planted (transform only on cutout). */
const HOVER_LIFT_PX = 10;
const SELECT_LIFT_PX = 14;

type SkylineProps = {
  buildings: Building[];
  selectedId: string | null;
  hoveredId: string | null;
  scrubYear: number;
  eraFilter?: Era | null;
  skipYearCheck?: boolean;
  sortDirection?: SortDirection;
  viewpointLabel?: string;
  newlyBuiltIds?: Set<string>;
  /**
   * Always shrink to fit viewport width (landing top-N). On narrow viewports
   * Skyline also force-fits after timeline/era interaction — this flag is
   * mainly for desktop landing clarity.
   */
  forceFitWidth?: boolean;
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
  skylineMaxPx: number,
  measuredAspect?: number,
): { heightPx: number; widthPx: number } {
  const heightPx = Math.max(
    28,
    (building.heightFt / tallest) * skylineMaxPx,
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
  skipYearCheck = false,
  sortDirection = "desc",
  viewpointLabel = "Manhattan skyline",
  newlyBuiltIds,
  forceFitWidth = false,
  onSelect,
  onHover,
}: SkylineProps) {
  const ordered = sortedByOrder(buildings, sortDirection);
  const visible = useMemo(
    () => buildingsVisibleInSkyline(ordered, scrubYear, eraFilter, skipYearCheck),
    [ordered, scrubYear, eraFilter, skipYearCheck],
  );
  const visibleCount = visible.length;
  const tallest = maxHeight(visible) || maxHeight(buildings) || 1;
  const maxWidthPx = sparseWidthCap(visibleCount);

  const scrollerRef = useRef<HTMLDivElement>(null);
  const rowRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);
  const [contentWidth, setContentWidth] = useState(0);
  /** SSR-safe: assume fits → justify-center; flip to start after measure if scroll needed. */
  const [fitsViewport, setFitsViewport] = useState(true);
  /** Desktop defaults for SSR/first paint; real viewport applied in layout effect. */
  const [skylineMaxPx, setSkylineMaxPx] = useState(SKYLINE_MAX_PX);
  const [isNarrow, setIsNarrow] = useState(false);
  const [measuredAspects, setMeasuredAspects] = useState<
    Record<string, number>
  >({});

  useLayoutEffect(() => {
    const syncMax = () => {
      setSkylineMaxPx(
        skylineMaxPxForViewport(
          window.innerWidth,
          window.innerHeight,
          visibleCount,
        ),
      );
    };
    syncMax();
    window.addEventListener("resize", syncMax);
    return () => window.removeEventListener("resize", syncMax);
  }, [visibleCount]);

  useLayoutEffect(() => {
    const scroller = scrollerRef.current;
    const row = rowRef.current;
    if (!scroller || !row) return;

    const update = () => {
      const available = Math.max(
        0,
        scroller.clientWidth - SKYLINE_SCROLL_PAD_PX * 2,
      );
      // Measure intrinsic width: a locked `width: contentWidth` prevents shrink
      // when the visible set gets narrower (era filter / landing subset), and
      // justify-center then parks towers off-screen past scrollLeft 0.
      const prevTransform = row.style.transform;
      const prevWidth = row.style.width;
      row.style.transform = "none";
      row.style.width = "max-content";
      const content = row.scrollWidth;
      row.style.width = prevWidth;
      row.style.transform = prevTransform;
      if (content <= 0 || available <= 0) return;
      setContentWidth(content);

      const mobile = scroller.clientWidth < SKYLINE_MOBILE_MAX_WIDTH_PX;
      setIsNarrow(mobile);
      // Mobile always force-fits (landing or post-filter). Desktop landing too.
      const nextScale = skylineFitScale(available, content, mobile, {
        forceFit: forceFitWidth || mobile,
      });
      setScale(nextScale);
      // Center when scaled content fits; last-resort min-scale overflow → scroll.
      setFitsViewport(content * nextScale <= available + 0.5);
    };

    update();
    const ro = new ResizeObserver(update);
    ro.observe(scroller);
    ro.observe(row);
    return () => ro.disconnect();
  }, [
    ordered.length,
    scrubYear,
    eraFilter,
    skipYearCheck,
    visibleCount,
    maxWidthPx,
    skylineMaxPx,
    forceFitWidth,
  ]);

  const rowHeightPx = skylineRowHeightPx(skylineMaxPx, { narrow: isNarrow });
  const rowHeight = rowHeightPx * scale;
  const scaledWidth = contentWidth > 0 ? contentWidth * scale : undefined;
  const padTopPx = skylinePadTopPx(isNarrow);
  const transition = `width ${SKYLINE_TRANSITION_MS}ms ${SKYLINE_EASE}, height ${SKYLINE_TRANSITION_MS}ms ${SKYLINE_EASE}, opacity ${SKYLINE_TRANSITION_MS}ms ${SKYLINE_EASE}, padding ${SKYLINE_TRANSITION_MS}ms ${SKYLINE_EASE}, transform ${SKYLINE_TRANSITION_MS}ms ${SKYLINE_EASE}`;

  return (
    <div
      ref={scrollerRef}
      className="skyline-scroll relative w-full"
      style={{ overflowX: fitsViewport ? "hidden" : "auto" }}
    >
      <div
        className={[
          "relative mx-auto",
          fitsViewport ? "overflow-hidden" : "overflow-visible",
        ].join(" ")}
        style={{
          width: "max-content",
          minWidth: "100%",
          paddingInline: SKYLINE_SCROLL_PAD_PX,
          height: rowHeight,
          transition: `height ${SKYLINE_TRANSITION_MS}ms ${SKYLINE_EASE}`,
        }}
      >
        <div
          className={[
            "relative mx-auto",
            // Contain unscaled layout width so fit-scale doesn't inflate scrollWidth.
            fitsViewport ? "overflow-hidden" : "overflow-visible",
          ].join(" ")}
          style={{
            width: scaledWidth ?? "100%",
            height: rowHeight,
            transition: `width ${SKYLINE_TRANSITION_MS}ms ${SKYLINE_EASE}, height ${SKYLINE_TRANSITION_MS}ms ${SKYLINE_EASE}`,
          }}
        >
          <SkylineHeightScale
            tallestFt={tallest}
            scale={scale}
            maxPx={skylineMaxPx}
            narrow={isNarrow}
          />
          <div
            ref={rowRef}
            className={[
              "relative z-[1] flex origin-top-left items-end pb-0",
              // Center when the row fits; start-align only when the user must scroll
              // so scrollLeft 0 is never empty space from justify-center.
              fitsViewport ? "justify-center" : "justify-start",
            ].join(" ")}
            style={{
              gap: GAP_PX,
              paddingTop: padTopPx,
              minHeight: rowHeightPx,
              transform: `scale(${scale})`,
              width: contentWidth || "max-content",
              transition: `transform ${SKYLINE_TRANSITION_MS}ms ${SKYLINE_EASE}`,
            }}
            aria-label={`${viewpointLabel}, towers along Manhattan`}
          >
            {ordered.map((building) => {
              const built = isSkylineVisible(
                building,
                scrubYear,
                eraFilter,
                skipYearCheck,
              );
              const justBuilt = newlyBuiltIds?.has(building.id) ?? false;
              const { heightPx, widthPx } = built
                ? towerSize(
                    building,
                    tallest,
                    maxWidthPx,
                    skylineMaxPx,
                    measuredAspects[building.id],
                  )
                : { heightPx: 0, widthPx: 0 };
              const selected = selectedId === building.id;
              const hovered = hoveredId === building.id;
              const emphasized = selected || hovered;
              const slotWidth = built ? widthPx + HIT_PAD_X * 2 : 0;

              const liftPx = selected
                ? SELECT_LIFT_PX
                : hovered
                  ? HOVER_LIFT_PX
                  : 0;
              const shadowWidth = built
                ? Math.max(12, widthPx * (emphasized ? 0.92 : 0.78))
                : 0;

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
                    "group relative flex shrink-0 flex-col items-center justify-end overflow-visible outline-none",
                    built ? "cursor-pointer" : "pointer-events-none",
                    emphasized ? "z-20" : "z-0 group-focus-visible:z-20",
                  ].join(" ")}
                  style={{
                    width: slotWidth,
                    paddingInline: built ? HIT_PAD_X : 0,
                    opacity: built ? 1 : 0,
                    transition: `width ${SKYLINE_TRANSITION_MS}ms ${SKYLINE_EASE}, opacity ${SKYLINE_TRANSITION_MS}ms ${SKYLINE_EASE}, padding ${SKYLINE_TRANSITION_MS}ms ${SKYLINE_EASE}`,
                  }}
                >
                  {/* Lift applies only to the tower — contact shadow stays on the ground */}
                  <span
                    className={[
                      "relative z-[1] block shrink-0",
                      selected
                        ? "text-[var(--accent)]"
                        : hovered
                          ? "text-[var(--steel-bright)]"
                          : "text-[var(--steel)]",
                      justBuilt ? "building-entrance" : "",
                    ].join(" ")}
                    style={{
                      height: heightPx,
                      width: widthPx,
                      transformOrigin: "bottom center",
                      transform: emphasized
                        ? `translateY(-${liftPx}px) scale(${SKYLINE_HOVER_SCALE})`
                        : "translateY(0) scale(1)",
                      transition,
                    }}
                  >
                    <span
                      className={[
                        "skyline-label",
                        built && selected ? "skyline-label--selected" : "",
                        built && hovered && !selected
                          ? "skyline-label--hovered"
                          : "",
                        built && (selected || hovered)
                          ? "opacity-100"
                          : "opacity-0 group-focus-visible:opacity-100",
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
                        className={[
                          "skyline-cutout block h-full w-full",
                          selected ? "skyline-cutout--selected" : "",
                          hovered && !selected ? "skyline-cutout--hovered" : "",
                        ].join(" ")}
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

                    {built && (selected || hovered) ? (
                      <span
                        aria-hidden
                        className="absolute -bottom-1 left-1/2 h-0.5 w-3/4 -translate-x-1/2 rounded-full bg-[var(--accent)]"
                      />
                    ) : null}
                  </span>

                  {built ? (
                    <span
                      aria-hidden
                      className={[
                        "skyline-tower-shadow",
                        emphasized ? "skyline-tower-shadow--emphasized" : "",
                      ].join(" ")}
                      style={{ width: shadowWidth }}
                    />
                  ) : null}
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
