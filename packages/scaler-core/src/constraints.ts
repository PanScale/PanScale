import type { Dimensions, ScalerOptions } from "./types";

/** Clamp a value between min and max. */
export function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

/** Clamp zoom level to configured bounds. */
export function clampZoom(zoom: number, options: ScalerOptions): number {
  return clamp(zoom, options.minZoom, options.maxZoom);
}

/** Get the scroll bounds for current dimensions and zoom. */
export function getScrollBounds(dimensions: Dimensions, zoom: number) {
  const scaledW = dimensions.contentWidth * zoom;
  const scaledH = dimensions.contentHeight * zoom;

  // When content is larger than viewport: scroll 0..overflow
  // When content is smaller than viewport: allow negative scroll so
  // content can be positioned anywhere while remaining fully visible.
  const minScrollLeft = scaledW < dimensions.clientWidth ? -(dimensions.clientWidth - scaledW) : 0;
  const maxScrollLeft = scaledW < dimensions.clientWidth ? 0 : scaledW - dimensions.clientWidth;
  const minScrollTop = scaledH < dimensions.clientHeight ? -(dimensions.clientHeight - scaledH) : 0;
  const maxScrollTop = scaledH < dimensions.clientHeight ? 0 : scaledH - dimensions.clientHeight;

  return { minScrollLeft, maxScrollLeft, minScrollTop, maxScrollTop };
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
    scrollLeft: clamp(scrollLeft, bounds.minScrollLeft, bounds.maxScrollLeft),
    scrollTop: clamp(scrollTop, bounds.minScrollTop, bounds.maxScrollTop)
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
