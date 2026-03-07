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
    activePointers.delete(e.pointerId);
    if (activePointers.size === 0) {
      scaler.doTouchEnd(e.timeStamp);
    } else {
      scaler.doTouchStart(getTouches(), e.timeStamp);
    }
    e.preventDefault();
  };

  element.addEventListener("pointerdown", onPointerDown);
  element.addEventListener("pointermove", onPointerMove);
  element.addEventListener("pointerup", onPointerUp);
  element.addEventListener("pointercancel", onPointerUp);

  return () => {
    element.removeEventListener("pointerdown", onPointerDown);
    element.removeEventListener("pointermove", onPointerMove);
    element.removeEventListener("pointerup", onPointerUp);
    element.removeEventListener("pointercancel", onPointerUp);
  };
}
