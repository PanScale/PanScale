import type { Scaler } from "@panscale/core";

interface GestureEvent extends Event {
  scale: number;
  pageX: number;
  pageY: number;
}

export function attachGestureEvents(element: HTMLElement, scaler: Scaler): () => void {
  let initialZoom = 1;

  const onGestureStart = (e: Event) => {
    const ge = e as GestureEvent;
    initialZoom = scaler.getValues().zoom;
    e.preventDefault();
  };

  const onGestureChange = (e: Event) => {
    const ge = e as GestureEvent;
    scaler.zoomTo(initialZoom * ge.scale, false, ge.pageX, ge.pageY);
    e.preventDefault();
  };

  const onGestureEnd = (e: Event) => {
    e.preventDefault();
  };

  element.addEventListener("gesturestart", onGestureStart);
  element.addEventListener("gesturechange", onGestureChange);
  element.addEventListener("gestureend", onGestureEnd);

  return () => {
    element.removeEventListener("gesturestart", onGestureStart);
    element.removeEventListener("gesturechange", onGestureChange);
    element.removeEventListener("gestureend", onGestureEnd);
  };
}
