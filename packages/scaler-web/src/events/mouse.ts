import type { Scaler } from "@scaler/core";

export function attachMouseEvents(element: HTMLElement, scaler: Scaler): () => void {
  let mouseDown = false;

  const onMouseDown = (e: MouseEvent) => {
    if (e.button !== 0) return;
    mouseDown = true;
    scaler.doTouchStart([{ pageX: e.pageX, pageY: e.pageY }], e.timeStamp);
    e.preventDefault();
  };

  const onMouseMove = (e: MouseEvent) => {
    if (!mouseDown) return;
    scaler.doTouchMove([{ pageX: e.pageX, pageY: e.pageY }], e.timeStamp);
    e.preventDefault();
  };

  const onMouseUp = (e: MouseEvent) => {
    if (!mouseDown) return;
    mouseDown = false;
    scaler.doTouchEnd(e.timeStamp);
    e.preventDefault();
  };

  element.addEventListener("mousedown", onMouseDown);
  document.addEventListener("mousemove", onMouseMove);
  document.addEventListener("mouseup", onMouseUp);

  return () => {
    element.removeEventListener("mousedown", onMouseDown);
    document.removeEventListener("mousemove", onMouseMove);
    document.removeEventListener("mouseup", onMouseUp);
  };
}
