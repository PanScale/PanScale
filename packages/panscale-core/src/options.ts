import type { ScalerOptions } from "./types";

export const DEFAULT_OPTIONS: ScalerOptions = {
  scrollingX: true,
  scrollingY: true,
  animating: true,
  bouncing: true,
  locking: true,
  paging: false,
  snapping: false,
  zooming: false,
  minZoom: 0.5,
  maxZoom: 3,
  deceleration: 0.95,
  animationProvider: null
};

export function mergeOptions(overrides?: Partial<ScalerOptions>): ScalerOptions {
  if (!overrides) return { ...DEFAULT_OPTIONS };
  return { ...DEFAULT_OPTIONS, ...overrides };
}
