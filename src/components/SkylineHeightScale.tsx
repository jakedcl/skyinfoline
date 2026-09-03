"use client";

import {
  heightFtToRowY,
  heightScaleTicks,
  SKYLINE_MAX_PX,
  skylineRowHeightPx,
} from "@/lib/skyline-layout";

type SkylineHeightScaleProps = {
  tallestFt: number;
  scale: number;
  maxPx?: number;
};

const LABEL_GUTTER = 40;

export function SkylineHeightScale({
  tallestFt,
  scale,
  maxPx = SKYLINE_MAX_PX,
}: SkylineHeightScaleProps) {
  if (tallestFt <= 0) return null;

  const rowHeight = skylineRowHeightPx(maxPx) * scale;
  const ticks = heightScaleTicks(tallestFt);

  return (
    <div
      className="skyline-height-scale pointer-events-none absolute inset-x-0 top-0 z-0"
      style={{ height: rowHeight }}
      aria-hidden
    >
      <svg
        className="absolute inset-0 h-full w-full"
        width="100%"
        height={rowHeight}
      >
        {ticks.map((ft) => {
          const y = heightFtToRowY(ft, tallestFt, scale, maxPx);
          return (
            <line
              key={ft}
              x1={LABEL_GUTTER}
              y1={y}
              x2="100%"
              y2={y}
              className="skyline-height-scale__line"
            />
          );
        })}
      </svg>

      {ticks.map((ft) => {
        const y = heightFtToRowY(ft, tallestFt, scale, maxPx);
        const atGround = ft === 0;
        return (
          <span
            key={`label-${ft}`}
            className="skyline-height-scale__label"
            style={{
              top: atGround ? y - 2 : y,
              transform: atGround ? "translateY(-100%)" : "translateY(-50%)",
            }}
          >
            {ft.toLocaleString()}
          </span>
        );
      })}
      <span className="skyline-height-scale__unit">ft</span>
    </div>
  );
}
