export function applyTouchAction(element: HTMLElement): () => void {
  const original = element.style.touchAction;
  element.style.touchAction = "none";

  return () => {
    element.style.touchAction = original;
  };
}
