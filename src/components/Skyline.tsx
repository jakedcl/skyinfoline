"use client";

import Image from "next/image";
import {
  BuildingSilhouetteShape,
  silhouetteAspect,
} from "@/components/BuildingSilhouette";
import type { Building } from "@/types/building";
import { isBuiltByYear, maxHeight, sortedByOrder } from "@/lib/buildings";

const SKYLINE_MAX_PX = 340;
const MAX_WIDTH_PX = 56;
const MIN_WIDTH_PX = 18;
const GAP_PX = 10;

type SkylineProps = {
  buildings: Building[];
  selectedId: string | null;
  hoveredId: string | null;
  scrubYear: number;
  onSelect: (id: string) => void;
  onHover: (id: string | null) => void;
};

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

  return (
    <div className="skyline-scroll relative w-full overflow-x-auto overflow-y-hidden">
      <div
        className="relative mx-auto flex min-w-full items-end justify-center px-6 pb-0 pt-8"
        style={{ gap: GAP_PX, minHeight: SKYLINE_MAX_PX + 48 }}
        aria-label="Manhattan skyline, south to north"
      >
        {ordered.map((building) => {
          const built = isBuiltByYear(building, scrubYear);
          const heightPx = Math.max(
            28,
            (building.heightFt / tallest) * SKYLINE_MAX_PX,
          );
          const aspect = silhouetteAspect(building.silhouette ?? "rect");
          const naturalWidth = heightPx * aspect;
          const widthPx = Math.min(
            MAX_WIDTH_PX,
            Math.max(MIN_WIDTH_PX, naturalWidth),
          );
          const selected = selectedId === building.id;
          const hovered = hoveredId === building.id;

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
                  ? "cursor-pointer opacity-100"
                  : "cursor-not-allowed opacity-[0.14]",
                selected || hovered ? "-translate-y-1.5" : "translate-y-0",
              ].join(" ")}
              style={{ width: widthPx }}
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
                  selected ? "drop-shadow-[0_0_12px_rgba(232,168,56,0.35)]" : "",
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
  );
}
