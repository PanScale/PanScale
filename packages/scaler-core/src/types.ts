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
