import type { Matrix } from "transformation-matrix";

/** Platform-agnostic touch point. */
export interface ScalerTouch {
  pageX: number;
  pageY: number;
}

/** Decomposed transform values exposed to consumers. */
export interface ScalerValues {
  matrix: Matrix;
  translateX: number;
  translateY: number;
  zoom: number;
  scrollLeft: number;
  scrollTop: number;
  isInteracting: boolean;
}

/** Injectable animation frame provider. */
export interface AnimationProvider {
  requestFrame: (callback: () => void) => number;
  cancelFrame: (id: number) => void;
}

/** Pull-to-refresh lifecycle callbacks. */
export interface PullToRefreshCallbacks {
  onActivate: () => void;
  onDeactivate: () => void;
  onStart: () => void;
}

/** Pull-to-refresh state machine states. */
export type PullToRefreshState = "idle" | "pulling" | "active" | "refreshing";

/**
 * How far the scroll may go.
 * - `contain` (the default): content smaller than the viewport stays wholly inside it, and content
 *   larger covers it.
 * - `keepVisible`: the content may move past the viewport's edges, as long as at least `minVisible`
 *   pixels of it stay in the viewport on each axis (no more than the content's own size on screen). A zoom
 *   around a point keeps the point first: what a zoom out leaves in view always counts as enough, so a
 *   wheel or pinch out is never clamped. A pan, or a zoom in around a point off the content, that would
 *   leave less in view than `minVisible` (or than the view held before it) stops there.
 */
export type ScrollBoundsPolicy =
  | { kind: "contain" }
  | { kind: "keepVisible"; minVisible: number };

/** A scroll position and zoom: where the view was before a move, for the `keepVisible` bounds. */
export interface ScrollView {
  scrollLeft: number;
  scrollTop: number;
  zoom: number;
}

/** Configuration options for Scaler. */
export interface ScalerOptions {
  scrollingX: boolean;
  scrollingY: boolean;
  animating: boolean;
  bouncing: boolean;
  locking: boolean;
  paging: boolean;
  snapping: boolean;
  zooming: boolean;
  minZoom: number;
  maxZoom: number;
  deceleration: number;
  animationProvider: AnimationProvider | null;
  /** How far the scroll may go; see {@link ScrollBoundsPolicy}. */
  bounds: ScrollBoundsPolicy;
}

/** Dimensions of viewport and content. */
export interface Dimensions {
  clientWidth: number;
  clientHeight: number;
  contentWidth: number;
  contentHeight: number;
}

/** Element position in document. */
export interface Position {
  left: number;
  top: number;
}

/** Snap grid size. */
export interface SnapSize {
  width: number;
  height: number;
}
