/** Shared skyline row geometry — must stay in sync with Skyline tower scaling. */
export const SKYLINE_MAX_PX = 320;
export const SKYLINE_ROW_EXTRA_PX = 48;
export const SKYLINE_LABEL_RESERVE_PX = 72;
export const SKYLINE_ROW_HEIGHT_PX =
  SKYLINE_MAX_PX + SKYLINE_ROW_EXTRA_PX + SKYLINE_LABEL_RESERVE_PX;

/** Match CSS md breakpoint — used for mobile iconic landing. */
export const SKYLINE_MOBILE_MAX_WIDTH_PX = 768;
/** Soft left/right breathing room at the ends of the scroller. */
export const SKYLINE_SCROLL_PAD_PX = 40;
/** Hover / selected tower pop — bases stay planted via transform-origin bottom. */
export const SKYLINE_HOVER_SCALE = 1.1;

/** Vertical position from row top; matches `towerSize` height mapping × scale. */
export function heightFtToRowY(
  heightFt: number,
  tallestFt: number,
  scale = 1,
): number {
  const heightPx = (heightFt / tallestFt) * SKYLINE_MAX_PX;
  return (SKYLINE_ROW_HEIGHT_PX - heightPx) * scale;
}

/** Pick a round foot interval (~4–6 ticks) for the y-axis. */
export function heightScaleTickInterval(tallestFt: number): number {
  if (tallestFt <= 0) return 100;
  const targetTicks = 5;
  const rough = tallestFt / targetTicks;
  const candidates = [50, 100, 250, 500, 1000];
  return candidates.find((c) => rough <= c) ?? 1000;
}

export function heightScaleTicks(tallestFt: number): number[] {
  if (tallestFt <= 0) return [0];
  const interval = heightScaleTickInterval(tallestFt);
  const ticks: number[] = [0];
  for (let ft = interval; ft < tallestFt; ft += interval) {
    ticks.push(ft);
  }
  return ticks;
}
