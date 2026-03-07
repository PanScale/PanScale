import type { Dimensions, ScalerOptions } from "./types";

/** Clamp a value between min and max. */
export function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

/** Clamp zoom level to configured bounds. */
export function clampZoom(zoom: number, options: ScalerOptions): number {
  return clamp(zoom, options.minZoom, options.maxZoom);
}

/** Get the maximum scroll values for current dimensions and zoom. */
export function getScrollBounds(dimensions: Dimensions, zoom: number) {
  const maxScrollLeft = Math.max(0, dimensions.contentWidth * zoom - dimensions.clientWidth);
  const maxScrollTop = Math.max(0, dimensions.contentHeight * zoom - dimensions.clientHeight);
  return { maxScrollLeft, maxScrollTop };
}

/** Clamp scroll position to valid bounds. */
export function clampScroll(
  scrollLeft: number,
  scrollTop: number,
  dimensions: Dimensions,
  zoom: number
) {
  const bounds = getScrollBounds(dimensions, zoom);
  return {
    scrollLeft: clamp(scrollLeft, 0, bounds.maxScrollLeft),
    scrollTop: clamp(scrollTop, 0, bounds.maxScrollTop)
  };
}

/** Determine if axis should be locked based on initial movement direction. */
export function detectAxisLock(
  deltaX: number,
  deltaY: number,
  locking: boolean
): { lockX: boolean; lockY: boolean } {
  if (!locking) return { lockX: false, lockY: false };

  const absX = Math.abs(deltaX);
  const absY = Math.abs(deltaY);
  const threshold = 5;

  if (absX < threshold && absY < threshold) {
    return { lockX: false, lockY: false };
  }

  if (absX > absY + threshold) {
    return { lockX: false, lockY: true };
  }
  if (absY > absX + threshold) {
    return { lockX: true, lockY: false };
  }

  return { lockX: false, lockY: false };
}
