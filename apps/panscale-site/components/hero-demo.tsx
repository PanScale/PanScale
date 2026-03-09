"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import type { ScalerValues } from "@panscale/core";
import { createWebScaler, type WebScaler } from "@panscale/web";

const IMG_SRC = "https://picsum.photos/id/1015/1600/900";
const IMG_W = 1600;
const IMG_H = 900;

export function HeroDemo() {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const webScalerRef = useRef<WebScaler | null>(null);
  const [values, setValues] = useState<ScalerValues | null>(null);

  const calcFitZoom = useCallback((cw: number, ch: number) => {
    return Math.min(cw / IMG_W, ch / IMG_H);
  }, []);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const rect = el.getBoundingClientRect();
    const fitZoom = calcFitZoom(rect.width, rect.height);

    const ws = createWebScaler(el, {
      contentWidth: IMG_W,
      contentHeight: IMG_H,
      minZoom: fitZoom * 0.5,
      maxZoom: 8,
      zooming: true,
      bouncing: true,
      callback: setValues,
    });

    webScalerRef.current = ws;
    return () => ws.destroy();
  }, [calcFitZoom]);

  const zoomPct = values ? Math.round(values.zoom * 100) : 100;

  return (
    <div className="relative overflow-hidden rounded-2xl border border-fd-border bg-gray-950">
      <div
        ref={containerRef}
        className="h-[360px] w-full cursor-grab touch-none active:cursor-grabbing md:h-[420px]"
        style={{ position: "relative" }}
      >
        {values && (
          <img
            src={IMG_SRC}
            width={IMG_W}
            height={IMG_H}
            alt="Demo — drag to pan, scroll to zoom"
            draggable={false}
            style={{
              position: "absolute",
              left: 0,
              top: 0,
              display: "block",
              maxWidth: "none",
              imageRendering: "auto",
              transformOrigin: "0 0",
              transform: `matrix(${values.zoom}, 0, 0, ${values.zoom}, ${values.translateX}, ${values.translateY})`,
              willChange: "transform",
            }}
          />
        )}
      </div>
      <div className="absolute bottom-3 right-3 rounded-lg bg-black/60 px-3 py-1.5 text-xs font-mono text-white/80 backdrop-blur-sm">
        {zoomPct}%
      </div>
      <div className="absolute bottom-3 left-3 rounded-lg bg-black/60 px-3 py-1.5 text-xs text-white/60 backdrop-blur-sm">
        drag to pan &middot; scroll to zoom
      </div>
    </div>
  );
}
