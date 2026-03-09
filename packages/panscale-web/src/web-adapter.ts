import { Scaler, type ScalerOptions, type ScalerValues } from "@panscale/core";
import { attachPointerEvents } from "./events/pointer";
import { attachWheelEvents } from "./events/wheel";
import { attachGestureEvents } from "./events/gesture";
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
}

export function createWebScaler(element: HTMLElement, options: WebScalerOptions): WebScaler {
  const { callback, contentWidth, contentHeight, ...scalerOptions } = options;
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

  const resizeObserver = new ResizeObserver(() => {
    updateDimensions();
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
      resizeObserver.disconnect();
      scaler.destroy();
    }
  };
}
