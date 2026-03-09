"use client";

import { useEffect, useRef, useState } from "react";
import type { ScalerValues } from "@panscale/core";
import { createWebScaler, type WebScaler } from "@panscale/web";

const PAGES = [
  { color: "#3b82f6", title: "Page 1", desc: "Swipe horizontally to navigate pages" },
  { color: "#10b981", title: "Page 2", desc: "Content snaps to page boundaries" },
  { color: "#f59e0b", title: "Page 3", desc: "Works with momentum scrolling" },
  { color: "#8b5cf6", title: "Page 4", desc: "Touch-friendly page transitions" },
  { color: "#ef4444", title: "Page 5", desc: "Last page — swipe back!" },
];

export function SnapPagingDemo() {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const webScalerRef = useRef<WebScaler | null>(null);
  const [values, setValues] = useState<ScalerValues | null>(null);
  const [containerWidth, setContainerWidth] = useState(0);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const rect = el.getBoundingClientRect();
    const pageWidth = rect.width;
    setContainerWidth(pageWidth);
    const totalWidth = pageWidth * PAGES.length;

    const ws = createWebScaler(el, {
      callback: setValues,
      contentWidth: totalWidth,
      contentHeight: 300,
      zooming: false,
      bouncing: true,
      paging: true,
      scrollingY: false,
      locking: false,
    });
    webScalerRef.current = ws;

    const ro = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const w = entry.contentRect.width;
        setContainerWidth(w);
        ws.updateContentSize(w * PAGES.length, 300);
      }
    });
    ro.observe(el);

    return () => {
      ro.disconnect();
      ws.destroy();
      webScalerRef.current = null;
    };
  }, []);

  const tx = values?.translateX ?? 0;
  const currentPage = containerWidth > 0
    ? Math.round(-tx / containerWidth)
    : 0;

  return (
    <section>
      <h2 className="mb-2 text-lg font-semibold">Paging / Snap</h2>
      <p className="mb-3 text-sm text-gray-500 dark:text-gray-400">
        Horizontal paging with snap. Drag left/right to navigate pages.
      </p>

      <div className="mb-3 flex items-center gap-2">
        {PAGES.map((p, i) => (
          <button
            key={p.title}
            onClick={() => {
              webScalerRef.current?.scaler.scrollTo(containerWidth * i, 0, true);
            }}
            type="button"
            className={`rounded-full px-3 py-1 text-xs font-medium transition ${
              i === currentPage
                ? "bg-gray-800 text-white dark:bg-gray-200 dark:text-gray-900"
                : "bg-gray-200 text-gray-600 hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-300"
            }`}
          >
            {i + 1}
          </button>
        ))}
      </div>

      <div
        ref={containerRef}
        className="relative overflow-hidden rounded-xl border-2 border-gray-200 dark:border-gray-700"
        style={{ height: 300, cursor: "grab" }}
      >
        <div
          style={{
            transform: `translateX(${tx}px)`,
            willChange: "transform",
            position: "absolute",
            display: "flex",
            height: "100%",
          }}
        >
          {PAGES.map((page) => (
            <div
              key={page.title}
              style={{
                width: containerWidth || "100%",
                height: "100%",
                background: page.color,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                color: "white",
                flexShrink: 0,
              }}
            >
              <div style={{ fontSize: 32, fontWeight: 700, marginBottom: 8 }}>{page.title}</div>
              <div style={{ fontSize: 16, opacity: 0.85 }}>{page.desc}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-2 flex justify-center gap-2">
        {PAGES.map((_, i) => (
          <div
            key={i}
            className={`h-2 w-2 rounded-full transition ${
              i === currentPage ? "bg-gray-800 dark:bg-white" : "bg-gray-300 dark:bg-gray-600"
            }`}
          />
        ))}
      </div>
    </section>
  );
}
