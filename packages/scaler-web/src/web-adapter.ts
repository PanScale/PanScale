import { Scaler, type ScalerOptions, type ScalerValues } from "@scaler/core";
import { attachPointerEvents } from "./events/pointer";
import { attachWheelEvents } from "./events/wheel";
import { attachGestureEvents } from "./events/gesture";
import { applyTouchAction } from "./css";

export interface WebScaler {
  scaler: Scaler;
  destroy: () => void;
}

export interface WebScalerOptions extends Partial<ScalerOptions> {
  callback: (values: ScalerValues) => void;
}

export function createWebScaler(element: HTMLElement, options: WebScalerOptions): WebScaler {
  const { callback, ...scalerOptions } = options;
  const scaler = new Scaler(callback, { zooming: true, ...scalerOptions });

  const rect = element.getBoundingClientRect();
  scaler.setPosition(rect.left + window.scrollX, rect.top + window.scrollY);
  scaler.setDimensions(rect.width, rect.height, element.scrollWidth, element.scrollHeight);

  const cleanupPointer = attachPointerEvents(element, scaler);
  const cleanupWheel = attachWheelEvents(element, scaler);
  const cleanupGesture = attachGestureEvents(element, scaler);
  const cleanupCSS = applyTouchAction(element);

  const resizeObserver = new ResizeObserver((entries) => {
    for (const entry of entries) {
      const { width, height } = entry.contentRect;
      const r = element.getBoundingClientRect();
      scaler.setPosition(r.left + window.scrollX, r.top + window.scrollY);
      scaler.setDimensions(width, height, element.scrollWidth, element.scrollHeight);
    }
  });
  resizeObserver.observe(element);

  return {
    scaler,
    destroy() {
      cleanupPointer();
      cleanupWheel();
      cleanupGesture();
      cleanupCSS();
      resizeObserver.disconnect();
      scaler.destroy();
    }
  };
}
