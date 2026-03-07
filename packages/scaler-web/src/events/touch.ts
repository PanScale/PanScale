import type { Scaler, ScalerTouch } from "@scaler/core";

function toScalerTouches(touches: TouchList): ScalerTouch[] {
  const result: ScalerTouch[] = [];
  for (let i = 0; i < touches.length; i++) {
    const t = touches[i]!;
    result.push({ pageX: t.pageX, pageY: t.pageY });
  }
  return result;
}

export function attachTouchEvents(element: HTMLElement, scaler: Scaler): () => void {
  const onTouchStart = (e: TouchEvent) => {
    scaler.doTouchStart(toScalerTouches(e.touches), e.timeStamp);
    e.preventDefault();
  };

  const onTouchMove = (e: TouchEvent) => {
    scaler.doTouchMove(toScalerTouches(e.touches), e.timeStamp);
    e.preventDefault();
  };

  const onTouchEnd = (e: TouchEvent) => {
    scaler.doTouchEnd(e.timeStamp);
    e.preventDefault();
  };

  element.addEventListener("touchstart", onTouchStart, { passive: false });
  element.addEventListener("touchmove", onTouchMove, { passive: false });
  element.addEventListener("touchend", onTouchEnd, { passive: false });
  element.addEventListener("touchcancel", onTouchEnd, { passive: false });

  return () => {
    element.removeEventListener("touchstart", onTouchStart);
    element.removeEventListener("touchmove", onTouchMove);
    element.removeEventListener("touchend", onTouchEnd);
    element.removeEventListener("touchcancel", onTouchEnd);
  };
}
