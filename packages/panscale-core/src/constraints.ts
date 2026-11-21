import type { Dimensions, ScalerOptions, ScrollBoundsPolicy, ScrollView } from "./types";

const CONTAIN: ScrollBoundsPolicy = { kind: "contain" };

/** Clamp a value between min and max. */
export function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

/** Clamp zoom level to configured bounds. */
export function clampZoom(zoom: number, options: ScalerOptions): number {
  return clamp(zoom, options.minZoom, options.maxZoom);
}

/** How many pixels of content `scaled` long, scrolled by `scroll`, a viewport `client` long shows. */
function shownOnAxis(scroll: number, scaled: number, client: number): number {
  return Math.max(0, Math.min(client, scaled - scroll) - Math.max(0, -scroll));
}

/**
 * Get the scroll bounds for current dimensions and zoom. With the `keepVisible` policy, `before` is
 * where the view was before the move being bounded (the current view when left out): the bounds never ask
 * for more content in view than the view held then, scaled by the zoom since.
 */
export function getScrollBounds(
  dimensions: Dimensions,
  zoom: number,
  policy: ScrollBoundsPolicy = CONTAIN,
  before?: ScrollView
) {
  if (policy.kind === "keepVisible") return getKeepVisibleBounds(dimensions, zoom, policy.minVisible, before);
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

function getKeepVisibleBounds(
  dimensions: Dimensions,
  zoom: number,
  minVisible: number,
  before: ScrollView | undefined
) {
  const axis = (scaled: number, client: number, scrollBefore: number | undefined, scaledBefore: number) => {
    // A zoom around a point out keeps every point of the content it showed: what it showed, scaled by the
    // zoom, is still in view, so it is never more than the bounds ask for.
    const held =
      before === undefined || before.zoom <= 0 || scrollBefore === undefined
        ? Number.POSITIVE_INFINITY
        : (shownOnAxis(scrollBefore, scaledBefore, client) * zoom) / before.zoom;
    const least = Math.max(0, Math.min(minVisible, scaled, client, held));
    return { min: least - client, max: scaled - least };
  };
  const scaledW = dimensions.contentWidth * zoom;
  const scaledH = dimensions.contentHeight * zoom;
  const x = axis(
    scaledW,
    dimensions.clientWidth,
    before?.scrollLeft,
    dimensions.contentWidth * (before?.zoom ?? zoom)
  );
  const y = axis(
    scaledH,
    dimensions.clientHeight,
    before?.scrollTop,
    dimensions.contentHeight * (before?.zoom ?? zoom)
  );
  return { minScrollLeft: x.min, maxScrollLeft: x.max, minScrollTop: y.min, maxScrollTop: y.max };
}

/** Clamp scroll position to valid bounds. */
export function clampScroll(
  scrollLeft: number,
  scrollTop: number,
  dimensions: Dimensions,
  zoom: number,
  policy: ScrollBoundsPolicy = CONTAIN,
  before?: ScrollView
) {
  const bounds = getScrollBounds(dimensions, zoom, policy, before);
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
