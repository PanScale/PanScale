import type { AnimationProvider } from "./types";

function detectProvider(): AnimationProvider {
  if (typeof requestAnimationFrame !== "undefined") {
    return {
      requestFrame: (cb) => requestAnimationFrame(cb),
      cancelFrame: (id) => cancelAnimationFrame(id)
    };
  }
  return {
    requestFrame: (cb) => setTimeout(cb, 1000 / 60) as unknown as number,
    cancelFrame: (id) => clearTimeout(id)
  };
}

let cachedProvider: AnimationProvider | null = null;

export function getAnimationProvider(custom: AnimationProvider | null): AnimationProvider {
  if (custom) return custom;
  if (!cachedProvider) {
    cachedProvider = detectProvider();
  }
  return cachedProvider;
}
