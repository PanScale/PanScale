"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { ScalerValues } from "@panscale/core";
import { createWebScaler, type WebScaler } from "@panscale/web";

const CONTENT_WIDTH = 3000;
const CONTENT_HEIGHT = 2000;
const GRID_SIZE = 50;

export function GridCanvasDemo() {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const webScalerRef = useRef<WebScaler | null>(null);
  const [values, setValues] = useState<ScalerValues | null>(null);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const ws = createWebScaler(el, {
      callback: setValues,
      contentWidth: CONTENT_WIDTH,
      contentHeight: CONTENT_HEIGHT,
      zooming: true,
      bouncing: true,
      minZoom: 0.1,
      maxZoom: 5,
    });
    webScalerRef.current = ws;

    // Start centered-ish
    ws.scaler.zoomTo(0.3);
    const rect = el.getBoundingClientRect();
    const scaledW = CONTENT_WIDTH * 0.3;
    const scaledH = CONTENT_HEIGHT * 0.3;
    ws.scaler.scrollTo(
      Math.max(0, (scaledW - rect.width) / 2),
      Math.max(0, (scaledH - rect.height) / 2)
    );

    return () => {
      ws.destroy();
      webScalerRef.current = null;
    };
  }, []);

  const zoom = values?.zoom ?? 1;
  const tx = values?.translateX ?? 0;
  const ty = values?.translateY ?? 0;

  return (
    <section>
      <h2 className="mb-2 text-lg font-semibold">Infinite Canvas</h2>
      <p className="mb-3 text-sm text-gray-500 dark:text-gray-400">
        Large {CONTENT_WIDTH}×{CONTENT_HEIGHT} grid with cards. Drag to pan, scroll to zoom.
      </p>

      <div className="mb-3 flex items-center gap-2">
        <button onClick={() => webScalerRef.current?.scaler.zoomBy(0.7, true)} type="button" className="btn-ctrl">−</button>
        <span className="min-w-[4rem] text-center text-sm font-mono">{Math.round(zoom * 100)}%</span>
        <button onClick={() => webScalerRef.current?.scaler.zoomBy(1.3, true)} type="button" className="btn-ctrl">+</button>
        <button
          onClick={() => {
            webScalerRef.current?.scaler.zoomTo(1, true);
            webScalerRef.current?.scaler.scrollTo(0, 0, true);
          }}
          type="button"
          className="btn-ctrl"
        >
          Reset
        </button>
      </div>

      <div
        ref={containerRef}
        className="relative overflow-hidden rounded-xl border-2 border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-900"
        style={{ height: 450, cursor: "grab" }}
      >
        <div
          style={{
            transform: `translate(${tx}px, ${ty}px) scale(${zoom})`,
            transformOrigin: "0 0",
            willChange: "transform",
            position: "absolute",
          }}
        >
          <div style={{ width: CONTENT_WIDTH, height: CONTENT_HEIGHT, position: "relative" }}>
            {/* Grid lines */}
            <svg
              width={CONTENT_WIDTH}
              height={CONTENT_HEIGHT}
              style={{ position: "absolute", inset: 0 }}
            >
              {Array.from({ length: Math.ceil(CONTENT_WIDTH / GRID_SIZE) + 1 }, (_, i) => (
                <line
                  key={`v${i}`}
                  x1={i * GRID_SIZE} y1={0}
                  x2={i * GRID_SIZE} y2={CONTENT_HEIGHT}
                  stroke="#e5e7eb" strokeWidth={1}
                />
              ))}
              {Array.from({ length: Math.ceil(CONTENT_HEIGHT / GRID_SIZE) + 1 }, (_, i) => (
                <line
                  key={`h${i}`}
                  x1={0} y1={i * GRID_SIZE}
                  x2={CONTENT_WIDTH} y2={i * GRID_SIZE}
                  stroke="#e5e7eb" strokeWidth={1}
                />
              ))}
            </svg>
            {/* Cards */}
            {[
              { x: 200, y: 150, w: 240, h: 160, color: "#3b82f6", label: "Component A" },
              { x: 800, y: 300, w: 280, h: 200, color: "#10b981", label: "Service B" },
              { x: 500, y: 700, w: 200, h: 140, color: "#f59e0b", label: "Module C" },
              { x: 1400, y: 200, w: 260, h: 180, color: "#8b5cf6", label: "Gateway D" },
              { x: 1100, y: 800, w: 220, h: 150, color: "#ef4444", label: "Database E" },
              { x: 1800, y: 500, w: 300, h: 200, color: "#06b6d4", label: "Cache F" },
              { x: 2200, y: 300, w: 240, h: 160, color: "#ec4899", label: "Queue G" },
              { x: 2500, y: 900, w: 260, h: 180, color: "#14b8a6", label: "Worker H" },
            ].map((card) => (
              <div
                key={card.label}
                style={{
                  position: "absolute",
                  left: card.x,
                  top: card.y,
                  width: card.w,
                  height: card.h,
                  background: card.color,
                  borderRadius: 12,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "white",
                  fontWeight: 600,
                  fontSize: 16,
                  boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
                }}
              >
                {card.label}
              </div>
            ))}
            {/* Connection lines */}
            <svg
              width={CONTENT_WIDTH}
              height={CONTENT_HEIGHT}
              style={{ position: "absolute", inset: 0, pointerEvents: "none" }}
            >
              {[
                [320, 230, 800, 400],
                [800, 400, 600, 770],
                [1080, 400, 1400, 290],
                [1530, 380, 1210, 800],
                [1660, 380, 1800, 600],
                [2100, 600, 2200, 380],
                [2460, 380, 2630, 900],
              ].map(([x1, y1, x2, y2], i) => (
                <line
                  key={`conn${i}`}
                  x1={x1} y1={y1} x2={x2} y2={y2}
                  stroke="#94a3b8" strokeWidth={2} strokeDasharray="6 4"
                />
              ))}
            </svg>
          </div>
        </div>
      </div>

      {values && (
        <div className="mt-2 rounded-lg border border-gray-200 bg-white px-4 py-2 font-mono text-xs dark:border-gray-700 dark:bg-gray-900">
          <span className="mr-4">Zoom: {(zoom * 100).toFixed(0)}%</span>
          <span className="mr-4">Scroll: ({values.scrollLeft.toFixed(0)}, {values.scrollTop.toFixed(0)})</span>
        </div>
      )}
    </section>
  );
}
