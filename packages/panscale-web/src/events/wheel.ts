import type { Scaler } from "@panscale/core";

export function attachWheelEvents(element: HTMLElement, scaler: Scaler): () => void {
  const onWheel = (e: WheelEvent) => {
    scaler.doMouseZoom(-e.deltaY, e.timeStamp, e.pageX, e.pageY);
    e.preventDefault();
  };

  element.addEventListener("wheel", onWheel, { passive: false });

  return () => {
    element.removeEventListener("wheel", onWheel);
  };
}
