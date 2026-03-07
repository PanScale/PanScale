"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Scaler } from "@scaler/core";
import type { ScalerValues } from "@scaler/core";
import { createWebScaler, type WebScaler } from "@scaler/web";

const SAMPLE_IMAGES = [
  { src: "https://picsum.photos/id/1015/1600/900", w: 1600, h: 900, label: "Landscape 16:9" },
  { src: "https://picsum.photos/id/1025/800/1200", w: 800, h: 1200, label: "Portrait 2:3" },
  { src: "https://picsum.photos/id/1035/2400/600", w: 2400, h: 600, label: "Panorama 4:1" },
  { src: "https://picsum.photos/id/1043/1200/1200", w: 1200, h: 1200, label: "Square 1:1" },
];

type FitMode = "fit" | "fill";

export function ImageViewerDemo() {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const webScalerRef = useRef<WebScaler | null>(null);
  const [values, setValues] = useState<ScalerValues | null>(null);
  const [imageIdx, setImageIdx] = useState(0);
  const [fitMode, setFitMode] = useState<FitMode>("fit");
  const [containerSize, setContainerSize] = useState({ w: 0, h: 0 });

  const img = SAMPLE_IMAGES[imageIdx]!;

  const calcFitZoom = useCallback(
    (cw: number, ch: number) => {
      if (cw === 0 || ch === 0) return 1;
      return Math.min(cw / img.w, ch / img.h);
    },
    [img.w, img.h]
  );

  const calcFillZoom = useCallback(
    (cw: number, ch: number) => {
      if (cw === 0 || ch === 0) return 1;
      return Math.max(cw / img.w, ch / img.h);
    },
    [img.w, img.h]
  );

  // Initialize scaler
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const rect = el.getBoundingClientRect();
    const cw = rect.width;
    const ch = rect.height;
    setContainerSize({ w: cw, h: ch });

    const initZoom = fitMode === "fit" ? calcFitZoom(cw, ch) : calcFillZoom(cw, ch);

    const ws = createWebScaler(el, {
      callback: setValues,
      contentWidth: img.w,
      contentHeight: img.h,
      zooming: true,
      bouncing: true,
      minZoom: Math.min(initZoom * 0.5, 0.1),
      maxZoom: 5,
      locking: false,
    });
    webScalerRef.current = ws;

    // Set initial zoom and center
    ws.scaler.zoomTo(initZoom);
    centerContent(ws.scaler, cw, ch, initZoom);

    const ro = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const { width, height } = entry.contentRect;
        setContainerSize({ w: width, h: height });
      }
    });
    ro.observe(el);

    return () => {
      ro.disconnect();
      ws.destroy();
      webScalerRef.current = null;
    };
  }, [imageIdx]);

  function centerContent(scaler: Scaler, cw: number, ch: number, zoom: number) {
    const scaledW = img.w * zoom;
    const scaledH = img.h * zoom;
    const scrollLeft = scaledW > cw ? (scaledW - cw) / 2 : -(cw - scaledW) / 2;
    const scrollTop = scaledH > ch ? (scaledH - ch) / 2 : -(ch - scaledH) / 2;
    scaler.scrollTo(scrollLeft, scrollTop);
  }

  const applyFit = useCallback(() => {
    const ws = webScalerRef.current;
    if (!ws) return;
    setFitMode("fit");
    const cw = containerSize.w || containerRef.current?.getBoundingClientRect().width || 0;
    const ch = containerSize.h || containerRef.current?.getBoundingClientRect().height || 0;
    const zoom = calcFitZoom(cw, ch);
    ws.scaler.zoomTo(zoom, true);
    setTimeout(() => centerContent(ws.scaler, cw, ch, zoom), 280);
  }, [containerSize, calcFitZoom, img.w, img.h]);

  const applyFill = useCallback(() => {
    const ws = webScalerRef.current;
    if (!ws) return;
    setFitMode("fill");
    const cw = containerSize.w || containerRef.current?.getBoundingClientRect().width || 0;
    const ch = containerSize.h || containerRef.current?.getBoundingClientRect().height || 0;
    const zoom = calcFillZoom(cw, ch);
    ws.scaler.zoomTo(zoom, true);
    setTimeout(() => centerContent(ws.scaler, cw, ch, zoom), 280);
  }, [containerSize, calcFillZoom, img.w, img.h]);

  const reset1to1 = useCallback(() => {
    const ws = webScalerRef.current;
    if (!ws) return;
    const cw = containerSize.w || containerRef.current?.getBoundingClientRect().width || 0;
    const ch = containerSize.h || containerRef.current?.getBoundingClientRect().height || 0;
    ws.scaler.zoomTo(1, true);
    setTimeout(() => centerContent(ws.scaler, cw, ch, 1), 280);
  }, [containerSize, img.w, img.h]);

  const zoomIn = useCallback(() => {
    webScalerRef.current?.scaler.zoomBy(1.3, true);
  }, []);

  const zoomOut = useCallback(() => {
    webScalerRef.current?.scaler.zoomBy(0.7, true);
  }, []);

  // Calculate centering offset for rendering
  const zoom = values?.zoom ?? 1;
  const scaledW = img.w * zoom;
  const scaledH = img.h * zoom;
  const offsetX = scaledW < containerSize.w ? (containerSize.w - scaledW) / 2 : 0;
  const offsetY = scaledH < containerSize.h ? (containerSize.h - scaledH) / 2 : 0;

  const tx = (values?.translateX ?? 0) + offsetX;
  const ty = (values?.translateY ?? 0) + offsetY;

  return (
    <section>
      <h2 className="mb-2 text-lg font-semibold">Image Viewer</h2>
      <p className="mb-3 text-sm text-gray-500 dark:text-gray-400">
        Different aspect ratios with Fit/Fill modes. Drag to pan, scroll to zoom, pinch on touch.
      </p>

      {/* Image selector */}
      <div className="mb-3 flex flex-wrap items-center gap-2">
        {SAMPLE_IMAGES.map((si, i) => (
          <button
            key={si.label}
            onClick={() => setImageIdx(i)}
            type="button"
            className={`rounded-md px-3 py-1.5 text-sm font-medium transition ${
              i === imageIdx
                ? "bg-blue-600 text-white"
                : "bg-white text-gray-700 border border-gray-300 hover:bg-gray-50 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-600"
            }`}
          >
            {si.label}
          </button>
        ))}
      </div>

      {/* Controls */}
      <div className="mb-3 flex flex-wrap items-center gap-2">
        <button
          onClick={applyFit}
          type="button"
          className={`rounded-md px-3 py-1.5 text-sm font-medium transition ${
            fitMode === "fit"
              ? "bg-indigo-600 text-white"
              : "bg-white text-gray-700 border border-gray-300 hover:bg-gray-50 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-600"
          }`}
        >
          Fit
        </button>
        <button
          onClick={applyFill}
          type="button"
          className={`rounded-md px-3 py-1.5 text-sm font-medium transition ${
            fitMode === "fill"
              ? "bg-indigo-600 text-white"
              : "bg-white text-gray-700 border border-gray-300 hover:bg-gray-50 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-600"
          }`}
        >
          Fill
        </button>
        <div className="mx-2 h-6 w-px bg-gray-300 dark:bg-gray-600" />
        <button onClick={zoomOut} type="button" className="btn-ctrl">−</button>
        <span className="min-w-[4rem] text-center text-sm font-mono">
          {Math.round(zoom * 100)}%
        </span>
        <button onClick={zoomIn} type="button" className="btn-ctrl">+</button>
        <button onClick={reset1to1} type="button" className="btn-ctrl">1:1</button>
      </div>

      {/* Viewer */}
      <div
        ref={containerRef}
        className="relative overflow-hidden rounded-xl border-2 border-gray-200 bg-[#1a1a2e] dark:border-gray-700"
        style={{ height: 500, cursor: "grab" }}
      >
        {/* Checkerboard background pattern */}
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `
              linear-gradient(45deg, #222 25%, transparent 25%),
              linear-gradient(-45deg, #222 25%, transparent 25%),
              linear-gradient(45deg, transparent 75%, #222 75%),
              linear-gradient(-45deg, transparent 75%, #222 75%)
            `,
            backgroundSize: "20px 20px",
            backgroundPosition: "0 0, 0 10px, 10px -10px, -10px 0px",
            opacity: 0.3,
          }}
        />
        <div
          style={{
            transform: `translate(${tx}px, ${ty}px) scale(${zoom})`,
            transformOrigin: "0 0",
            willChange: "transform",
            position: "absolute",
          }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={img.src}
            alt={img.label}
            width={img.w}
            height={img.h}
            style={{ display: "block", imageRendering: "auto" }}
            draggable={false}
          />
        </div>
      </div>

      {/* Info bar */}
      {values && (
        <div className="mt-2 rounded-lg border border-gray-200 bg-white px-4 py-2 font-mono text-xs dark:border-gray-700 dark:bg-gray-900">
          <span className="mr-4">Image: {img.w}×{img.h}</span>
          <span className="mr-4">Zoom: {(zoom * 100).toFixed(0)}%</span>
          <span className="mr-4">Scroll: ({values.scrollLeft.toFixed(0)}, {values.scrollTop.toFixed(0)})</span>
          <span>Translate: ({values.translateX.toFixed(0)}, {values.translateY.toFixed(0)})</span>
        </div>
      )}
    </section>
  );
}
