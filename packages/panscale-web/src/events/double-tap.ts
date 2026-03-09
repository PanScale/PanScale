import type { Scaler } from "@panscale/core";

export interface DoubleTapOptions {
  doubleTapZoom: number;
}

export function attachDoubleTapEvents(
  element: HTMLElement,
  scaler: Scaler,
  options: DoubleTapOptions
): () => void {
  let lastTapTime = 0;
  let lastTapX = 0;
  let lastTapY = 0;
  let downTime = 0;
  let downX = 0;
  let downY = 0;

  function onPointerDown(e: PointerEvent) {
    downTime = e.timeStamp;
    downX = e.clientX;
    downY = e.clientY;
  }

  function onPointerUp(e: PointerEvent) {
    const holdDuration = e.timeStamp - downTime;
    const moveDist = Math.sqrt((e.clientX - downX) ** 2 + (e.clientY - downY) ** 2);

    // Ignore drags: >10px move or >300ms hold
    if (moveDist > 10 || holdDuration > 300) return;

    const now = e.timeStamp;
    const tapX = e.clientX;
    const tapY = e.clientY;

    const timeSinceLastTap = now - lastTapTime;
    const distFromLastTap = Math.sqrt((tapX - lastTapX) ** 2 + (tapY - lastTapY) ** 2);

    if (timeSinceLastTap < 300 && distFromLastTap < 30) {
      // Double-tap detected
      const rect = element.getBoundingClientRect();
      const originX = tapX - rect.left;
      const originY = tapY - rect.top;

      const currentZoom = scaler.getValues().zoom;
      const targetZoom = options.doubleTapZoom;

      // If close to target (within 5%), zoom to 0 (Scaler clamps to minZoom)
      const target = Math.abs(currentZoom - targetZoom) / targetZoom < 0.05 ? 0 : targetZoom;

      scaler.zoomTo(target, true, originX, originY);

      // Reset to prevent triple-tap
      lastTapTime = 0;
      lastTapX = 0;
      lastTapY = 0;
    } else {
      lastTapTime = now;
      lastTapX = tapX;
      lastTapY = tapY;
    }
  }

  element.addEventListener("pointerdown", onPointerDown);
  element.addEventListener("pointerup", onPointerUp);

  return () => {
    element.removeEventListener("pointerdown", onPointerDown);
    element.removeEventListener("pointerup", onPointerUp);
  };
}
