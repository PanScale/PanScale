import type { Scaler, ScalerTouch } from "@scaler/core";

export function attachPointerEvents(element: HTMLElement, scaler: Scaler): () => void {
  const activePointers = new Map<number, ScalerTouch>();

  function getTouches(): ScalerTouch[] {
    return Array.from(activePointers.values());
  }

  const onPointerDown = (e: PointerEvent) => {
    activePointers.set(e.pointerId, { pageX: e.pageX, pageY: e.pageY });
    element.setPointerCapture(e.pointerId);
    scaler.doTouchStart(getTouches(), e.timeStamp);
    e.preventDefault();
  };

  const onPointerMove = (e: PointerEvent) => {
    if (!activePointers.has(e.pointerId)) return;
    activePointers.set(e.pointerId, { pageX: e.pageX, pageY: e.pageY });
    scaler.doTouchMove(getTouches(), e.timeStamp);
    e.preventDefault();
  };

  const onPointerUp = (e: PointerEvent) => {
    if (!activePointers.has(e.pointerId)) return;
    activePointers.delete(e.pointerId);
    if (activePointers.size === 0) {
      scaler.doTouchEnd(e.timeStamp);
    } else {
      scaler.doTouchStart(getTouches(), e.timeStamp);
    }
  };

  const onLostCapture = (e: PointerEvent) => {
    if (!activePointers.has(e.pointerId)) return;
    activePointers.delete(e.pointerId);
    if (activePointers.size === 0) {
      scaler.doTouchEnd(e.timeStamp);
    }
  };

  // pointerdown on element to start tracking
  element.addEventListener("pointerdown", onPointerDown);
  // move/up on document to catch events when cursor leaves element
  document.addEventListener("pointermove", onPointerMove);
  document.addEventListener("pointerup", onPointerUp);
  document.addEventListener("pointercancel", onPointerUp);
  // fallback: if pointer capture is lost, treat as end
  element.addEventListener("lostpointercapture", onLostCapture);

  return () => {
    element.removeEventListener("pointerdown", onPointerDown);
    document.removeEventListener("pointermove", onPointerMove);
    document.removeEventListener("pointerup", onPointerUp);
    document.removeEventListener("pointercancel", onPointerUp);
    element.removeEventListener("lostpointercapture", onLostCapture);
  };
}
