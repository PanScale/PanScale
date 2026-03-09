import { Scaler, type ScalerOptions, type ScalerValues } from "@panscale/core";
import { attachPointerEvents } from "./events/pointer";
import { attachWheelEvents } from "./events/wheel";
import { attachGestureEvents } from "./events/gesture";
import { attachDoubleTapEvents } from "./events/double-tap";
import { applyTouchAction } from "./css";

export interface WebScaler {
  scaler: Scaler;
  updateContentSize: (width: number, height: number) => void;
  destroy: () => void;
}

export interface WebScalerOptions extends Partial<ScalerOptions> {
  callback: (values: ScalerValues) => void;
  contentWidth?: number;
  contentHeight?: number;
  doubleTapZoom?: number;
  onResize?: (size: { width: number; height: number }) => void;
}

export function createWebScaler(element: HTMLElement, options: WebScalerOptions): WebScaler {
  const { callback, contentWidth, contentHeight, doubleTapZoom, onResize, ...scalerOptions } = options;
  const scaler = new Scaler(callback, { zooming: true, ...scalerOptions });

  function updateDimensions() {
    const rect = element.getBoundingClientRect();
    scaler.setPosition(rect.left + window.scrollX, rect.top + window.scrollY);
    const cw = contentWidth ?? element.scrollWidth;
    const ch = contentHeight ?? element.scrollHeight;
    scaler.setDimensions(rect.width, rect.height, cw, ch);
  }

  updateDimensions();

  const cleanupPointer = attachPointerEvents(element, scaler);
  const cleanupWheel = attachWheelEvents(element, scaler);
  const cleanupGesture = attachGestureEvents(element, scaler);
  const cleanupCSS = applyTouchAction(element);
  const cleanupDoubleTap = doubleTapZoom
    ? attachDoubleTapEvents(element, scaler, { doubleTapZoom })
    : null;

  const resizeObserver = new ResizeObserver((entries) => {
    updateDimensions();
    if (onResize && entries[0]) {
      const { width, height } = entries[0].contentRect;
      onResize({ width, height });
    }
  });
  resizeObserver.observe(element);

  return {
    scaler,
    updateContentSize(w: number, h: number) {
      const rect = element.getBoundingClientRect();
      scaler.setPosition(rect.left + window.scrollX, rect.top + window.scrollY);
      scaler.setDimensions(rect.width, rect.height, w, h);
    },
    destroy() {
      cleanupPointer();
      cleanupWheel();
      cleanupGesture();
      cleanupCSS();
      cleanupDoubleTap?.();
      resizeObserver.disconnect();
      scaler.destroy();
    }
  };
}
