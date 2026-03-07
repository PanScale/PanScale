/** Page/grid snapping logic. */

import type { Dimensions, SnapSize } from "../types";

/** Snap a scroll position to the nearest page boundary. */
export function snapToPage(
  scrollLeft: number,
  scrollTop: number,
  dimensions: Dimensions
): { scrollLeft: number; scrollTop: number } {
  const pageX = Math.round(scrollLeft / dimensions.clientWidth) * dimensions.clientWidth;
  const pageY = Math.round(scrollTop / dimensions.clientHeight) * dimensions.clientHeight;
  return { scrollLeft: pageX, scrollTop: pageY };
}

/** Snap a scroll position to the nearest grid cell. */
export function snapToGrid(
  scrollLeft: number,
  scrollTop: number,
  snapSize: SnapSize
): { scrollLeft: number; scrollTop: number } {
  const gridX = Math.round(scrollLeft / snapSize.width) * snapSize.width;
  const gridY = Math.round(scrollTop / snapSize.height) * snapSize.height;
  return { scrollLeft: gridX, scrollTop: gridY };
}
