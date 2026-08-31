"use client";

import Image from "next/image";
import { useLayoutEffect, useRef, useState } from "react";
import {
  BuildingSilhouetteShape,
  silhouetteAspect,
} from "@/components/BuildingSilhouette";
import type { Building } from "@/types/building";
import { isBuiltByYear, maxHeight, sortedByOrder } from "@/lib/buildings";
import { importancePresence } from "@/lib/importance";

const SKYLINE_MAX_PX = 320;
const MAX_WIDTH_PX = 48;
const MIN_WIDTH_PX = 16;
const HIT_PAD_X = 4;
const GAP_PX = 4;

type SkylineProps = {
  buildings: Building[];
  selectedId: string | null;
  hoveredId: string | null;
  scrubYear: number;
  onSelect: (id: string) => void;
  onHover: (id: string | null) => void;
};

function buildingWidthPx(building: Building, tallest: number): number {
  const heightPx = Math.max(
    28,
    (building.heightFt / tallest) * SKYLINE_MAX_PX,
  );
  const aspect = silhouetteAspect(building.silhouette ?? "rect");
  const naturalWidth = heightPx * aspect;
  return Math.min(MAX_WIDTH_PX, Math.max(MIN_WIDTH_PX, naturalWidth));
}

export function Skyline({
  buildings,
  selectedId,
  hoveredId,
  scrubYear,
  onSelect,
  onHover,
}: SkylineProps) {
  const ordered = sortedByOrder(buildings);
  const tallest = maxHeight(buildings) || 1;
  const scrollerRef = useRef<HTMLDivElement>(null);
  const rowRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);
  const [contentWidth, setContentWidth] = useState(0);

  useLayoutEffect(() => {
    const scroller = scrollerRef.current;
    const row = rowRef.current;
    if (!scroller || !row) return;

    const update = () => {
      const available = scroller.clientWidth - 24;
      // Temporarily measure unscaled width
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
    return () => ro.disconnect();
  }, [ordered.length]);

  const rowHeight = (SKYLINE_MAX_PX + 48) * scale;
  const scaledWidth = contentWidth > 0 ? contentWidth * scale : undefined;

  return (
    <div
      ref={scrollerRef}
      className="skyline-scroll relative w-full overflow-x-auto overflow-y-hidden"
    >
      <div
        className="mx-auto overflow-hidden"
        style={{
          width: scaledWidth,
          height: rowHeight + 8,
          maxWidth: "100%",
        }}
      >
        <div
          ref={rowRef}
          className="relative flex origin-top-left items-end justify-center pb-0 pt-8"
          style={{
            gap: GAP_PX,
            minHeight: SKYLINE_MAX_PX + 48,
            transform: `scale(${scale})`,
            width: contentWidth || "max-content",
          }}
          aria-label="Manhattan skyline, south to north"
        >
          {ordered.map((building) => {
            const built = isBuiltByYear(building, scrubYear);
            const heightPx = Math.max(
              28,
              (building.heightFt / tallest) * SKYLINE_MAX_PX,
            );
            const widthPx = buildingWidthPx(building, tallest);
            const selected = selectedId === building.id;
            const hovered = hoveredId === building.id;
            const presence = importancePresence(building.skylineImportance);

            return (
              <button
                key={building.id}
                type="button"
                aria-pressed={selected}
                aria-label={`${building.name}, ${building.heightFt} feet, completed ${building.yearCompleted}`}
                disabled={!built}
                onClick={() => built && onSelect(building.id)}
                onMouseEnter={() => built && onHover(building.id)}
                onMouseLeave={() => onHover(null)}
                onFocus={() => built && onHover(building.id)}
                onBlur={() => onHover(null)}
                className={[
                  "group relative flex shrink-0 flex-col items-center outline-none transition-[opacity,transform] duration-300 ease-out",
                  built
                    ? "cursor-pointer"
                    : "cursor-not-allowed opacity-[0.14]",
                  selected || hovered ? "-translate-y-1.5" : "translate-y-0",
                ].join(" ")}
                style={{
                  width: widthPx + HIT_PAD_X * 2,
                  paddingInline: HIT_PAD_X,
                  opacity: built ? (selected || hovered ? 1 : presence) : undefined,
                }}
              >
                <span
                  className={[
                    "pointer-events-none mb-2 max-w-[9rem] truncate text-center text-[10px] tracking-wide uppercase transition-opacity duration-200",
                    selected || hovered
                      ? "opacity-100 text-[var(--accent)]"
                      : "opacity-0 text-[var(--ink-muted)] group-focus-visible:opacity-100",
                  ].join(" ")}
                >
                  {building.name}
                </span>

                <span
                  className={[
                    "relative block transition-[filter,color] duration-300",
                    selected
                      ? "text-[var(--accent)]"
                      : hovered
                        ? "text-[var(--steel-bright)]"
                        : "text-[var(--steel)]",
                    selected
                      ? "drop-shadow-[0_0_12px_rgba(232,168,56,0.35)]"
                      : "",
                  ].join(" ")}
                  style={{ height: heightPx, width: widthPx }}
                >
                  {building.imageSrc ? (
                    <Image
                      src={building.imageSrc}
                      alt=""
                      width={widthPx * 2}
                      height={heightPx * 2}
                      className="h-full w-full object-contain object-bottom"
                      unoptimized
                    />
                  ) : (
                    <BuildingSilhouetteShape
                      type={building.silhouette ?? "rect"}
                      className="h-full w-full"
                      title={building.name}
                    />
                  )}

                  {selected ? (
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
