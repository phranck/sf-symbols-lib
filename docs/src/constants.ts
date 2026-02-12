/**
 * Named constants extracted from magic numbers across the codebase.
 */

/** Duration of the smooth scroll animation in milliseconds. */
export const SCROLL_ANIMATION_MS = 480;

/** Margin in pixels between a card and the header/preview boundary. */
export const SCROLL_MARGIN_PX = 16;

/** Delay before scrolling the selected card into view after preview opens. */
export const PREVIEW_OPEN_DELAY_MS = 550;

/** Duration the toast notification stays visible before auto-dismissing. */
export const TOAST_DISMISS_MS = 2500;

/** Tolerance in pixels when comparing card top positions to detect grid columns. */
export const GRID_COLUMN_TOLERANCE_PX = 5;

/** Fuse.js fuzzy search threshold (0 = exact, 1 = match anything). */
export const FUSE_THRESHOLD = 0.3;
