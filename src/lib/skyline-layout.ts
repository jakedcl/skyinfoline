/** Shared skyline row geometry — must stay in sync with Skyline tower scaling. */
export const SKYLINE_MAX_PX = 320;
export const SKYLINE_ROW_EXTRA_PX = 48;
export const SKYLINE_LABEL_RESERVE_PX = 72;
/** Tighter mobile chrome so towers sit higher in the frame. */
export const SKYLINE_MOBILE_ROW_EXTRA_PX = 24;
export const SKYLINE_MOBILE_LABEL_RESERVE_PX = 40;
/** Tailwind-equivalent top pad for angled name labels (pt-20 / pt-8). */
export const SKYLINE_PAD_TOP_PX = 80;
export const SKYLINE_MOBILE_PAD_TOP_PX = 32;
export const SKYLINE_ROW_HEIGHT_PX =
  SKYLINE_MAX_PX + SKYLINE_ROW_EXTRA_PX + SKYLINE_LABEL_RESERVE_PX;

/** Match CSS md breakpoint — narrow skyline chrome / fit-scale rules. */
export const SKYLINE_MOBILE_MAX_WIDTH_PX = 768;
/** Soft left/right breathing room at the ends of the scroller. */
export const SKYLINE_SCROLL_PAD_PX = 40;
/** Hover / selected tower pop — bases stay planted via transform-origin bottom. */
export const SKYLINE_HOVER_SCALE = 1.1;

/** Mobile tower max: taller than desktop, without dominating the first screen. */
export const SKYLINE_MOBILE_VH_FRACTION = 0.42;
export const SKYLINE_MOBILE_MAX_CAP_PX = 400;
/**
 * Cap tower height by available width so aspect-driven cutouts stay fitable.
 * At ~460px available (540 viewport) → ~345px; at ~310px (390) → ~232px.
 */
export const SKYLINE_MOBILE_WIDTH_HEIGHT_FACTOR = 0.75;
/** Floor so very narrow phones don't collapse towers to unreadable stubs. */
export const SKYLINE_MOBILE_MIN_MAX_PX = 240;

/**
 * Below this fit scale on mobile, keep full tower height and allow horizontal
 * scroll (full eras / dense sets). Landing / forceFit always shrinks to width.
 */
export const SKYLINE_MOBILE_MIN_FIT_SCALE = 0.52;

export type SkylineRowOpts = {
  /** Narrow viewport — use compact label/extra reserve. */
  narrow?: boolean;
};

export function skylineLabelReservePx(narrow = false): number {
  return narrow ? SKYLINE_MOBILE_LABEL_RESERVE_PX : SKYLINE_LABEL_RESERVE_PX;
}

export function skylineRowExtraPx(narrow = false): number {
  return narrow ? SKYLINE_MOBILE_ROW_EXTRA_PX : SKYLINE_ROW_EXTRA_PX;
}

export function skylinePadTopPx(narrow = false): number {
  return narrow ? SKYLINE_MOBILE_PAD_TOP_PX : SKYLINE_PAD_TOP_PX;
}

export function skylineRowHeightPx(
  maxPx: number,
  opts: SkylineRowOpts = {},
): number {
  const narrow = opts.narrow ?? false;
  return maxPx + skylineRowExtraPx(narrow) + skylineLabelReservePx(narrow);
}

/**
 * Desktop stays at SKYLINE_MAX_PX. Mobile may boost toward min(42vh, 400), but
 * height is also capped by available width — taller only when there's room so
 * the landing top-N (aspect-driven widths) can still fit on screen.
 */
export function skylineMaxPxForViewport(
  viewportWidthPx: number,
  viewportHeightPx: number,
): number {
  if (viewportWidthPx >= SKYLINE_MOBILE_MAX_WIDTH_PX) return SKYLINE_MAX_PX;

  const vhCap = Math.min(
    SKYLINE_MOBILE_MAX_CAP_PX,
    Math.round(viewportHeightPx * SKYLINE_MOBILE_VH_FRACTION),
  );
  const available = Math.max(
    0,
    viewportWidthPx - SKYLINE_SCROLL_PAD_PX * 2,
  );
  const widthCap = Math.round(available * SKYLINE_MOBILE_WIDTH_HEIGHT_FACTOR);
  const heightBudget = Math.max(SKYLINE_MOBILE_MIN_MAX_PX, widthCap);

  // Boost above desktop when both vh and width allow; otherwise shrink toward
  // the width budget so narrow phones don't force horizontal clip of top-10.
  return Math.min(Math.max(SKYLINE_MAX_PX, vhCap), heightBudget);
}

export type SkylineFitScaleOpts = {
  /**
   * Always shrink to fit (landing top-N). When false on mobile, refuse scales
   * below SKYLINE_MOBILE_MIN_FIT_SCALE so dense eras stay full-height + scroll.
   */
  forceFit?: boolean;
};

/**
 * Fit scale for the measured content width. On mobile, refuse tiny scales so
 * dense eras stay scrollable at full tower height — unless forceFit (landing).
 */
export function skylineFitScale(
  availablePx: number,
  contentPx: number,
  narrow: boolean,
  opts: SkylineFitScaleOpts = {},
): number {
  if (contentPx <= 0 || availablePx <= 0) return 1;
  const fit = Math.min(1, availablePx / contentPx);
  if (!narrow || opts.forceFit) return fit;
  return fit >= SKYLINE_MOBILE_MIN_FIT_SCALE ? fit : 1;
}

/** Vertical position from row top; matches `towerSize` height mapping × scale. */
export function heightFtToRowY(
  heightFt: number,
  tallestFt: number,
  scale = 1,
  maxPx = SKYLINE_MAX_PX,
  opts: SkylineRowOpts = {},
): number {
  const heightPx = (heightFt / tallestFt) * maxPx;
  return (skylineRowHeightPx(maxPx, opts) - heightPx) * scale;
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
