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
  const [showDebug, setShowDebug] = useState(true);
  const [forceCenter, setForceCenter] = useState(true);
  const [lastPinchCenter, setLastPinchCenter] = useState<{ x: number; y: number } | null>(null);

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

  // Track pointer positions for debug crosshair
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const pointers = new Map<number, { x: number; y: number }>();

    const onPointerDown = (e: PointerEvent) => {
      const rect = el.getBoundingClientRect();
      pointers.set(e.pointerId, { x: e.clientX - rect.left, y: e.clientY - rect.top });
      updateCenter();
    };
    const onPointerMove = (e: PointerEvent) => {
      if (!pointers.has(e.pointerId)) return;
      const rect = el.getBoundingClientRect();
      pointers.set(e.pointerId, { x: e.clientX - rect.left, y: e.clientY - rect.top });
      updateCenter();
    };
    const onPointerUp = (e: PointerEvent) => {
      pointers.delete(e.pointerId);
      if (pointers.size === 0) setLastPinchCenter(null);
      else updateCenter();
    };

    function updateCenter() {
      if (pointers.size >= 2) {
        const pts = Array.from(pointers.values());
        const cx = pts.reduce((s, p) => s + p.x, 0) / pts.length;
        const cy = pts.reduce((s, p) => s + p.y, 0) / pts.length;
        setLastPinchCenter({ x: cx, y: cy });
      } else if (pointers.size === 1) {
        const p = Array.from(pointers.values())[0]!;
        setLastPinchCenter({ x: p.x, y: p.y });
      }
    }

    el.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("pointermove", onPointerMove);
    document.addEventListener("pointerup", onPointerUp);
    document.addEventListener("pointercancel", onPointerUp);

    return () => {
      el.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("pointermove", onPointerMove);
      document.removeEventListener("pointerup", onPointerUp);
      document.removeEventListener("pointercancel", onPointerUp);
    };
  }, []);

  function getCenterScroll(cw: number, ch: number, zoom: number) {
    const scaledW = img.w * zoom;
    const scaledH = img.h * zoom;
    return {
      scrollLeft: scaledW > cw ? (scaledW - cw) / 2 : -(cw - scaledW) / 2,
      scrollTop: scaledH > ch ? (scaledH - ch) / 2 : -(ch - scaledH) / 2,
    };
  }

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
    const { scrollLeft, scrollTop } = getCenterScroll(cw, ch, initZoom);
    ws.scaler.scrollToWithZoom(scrollLeft, scrollTop, initZoom);

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

  const applyFit = useCallback(() => {
    const ws = webScalerRef.current;
    if (!ws) return;
    setFitMode("fit");
    const cw = containerSize.w || containerRef.current?.getBoundingClientRect().width || 0;
    const ch = containerSize.h || containerRef.current?.getBoundingClientRect().height || 0;
    const zoom = calcFitZoom(cw, ch);
    const { scrollLeft, scrollTop } = getCenterScroll(cw, ch, zoom);
    ws.scaler.scrollToWithZoom(scrollLeft, scrollTop, zoom, true);
  }, [containerSize, calcFitZoom, img.w, img.h]);

  const applyFill = useCallback(() => {
    const ws = webScalerRef.current;
    if (!ws) return;
    setFitMode("fill");
    const cw = containerSize.w || containerRef.current?.getBoundingClientRect().width || 0;
    const ch = containerSize.h || containerRef.current?.getBoundingClientRect().height || 0;
    const zoom = calcFillZoom(cw, ch);
    const { scrollLeft, scrollTop } = getCenterScroll(cw, ch, zoom);
    ws.scaler.scrollToWithZoom(scrollLeft, scrollTop, zoom, true);
  }, [containerSize, calcFillZoom, img.w, img.h]);

  const reset1to1 = useCallback(() => {
    const ws = webScalerRef.current;
    if (!ws) return;
    const cw = containerSize.w || containerRef.current?.getBoundingClientRect().width || 0;
    const ch = containerSize.h || containerRef.current?.getBoundingClientRect().height || 0;
    const { scrollLeft, scrollTop } = getCenterScroll(cw, ch, 1);
    ws.scaler.scrollToWithZoom(scrollLeft, scrollTop, 1, true);
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
  // When center is forced and content is smaller than viewport on an axis,
  // lock to centered position (ignore scaler scroll on that axis).
  // When center is off, use the scaler's translateX/Y directly — the scaler's
  // scroll bounds allow free positioning within the viewport.
  const tx = forceCenter && scaledW < containerSize.w
    ? (containerSize.w - scaledW) / 2
    : (values?.translateX ?? 0);
  const ty = forceCenter && scaledH < containerSize.h
    ? (containerSize.h - scaledH) / 2
    : (values?.translateY ?? 0);

  // Debug: image border corners in viewport space
  const imgLeft = tx;
  const imgTop = ty;
  const imgRight = tx + scaledW;
  const imgBottom = ty + scaledH;

  // Debug: viewport center
  const vpCenterX = containerSize.w / 2;
  const vpCenterY = containerSize.h / 2;

  // Debug: image center in viewport space
  const imgCenterX = imgLeft + scaledW / 2;
  const imgCenterY = imgTop + scaledH / 2;

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
        <div className="mx-2 h-6 w-px bg-gray-300 dark:bg-gray-600" />
        <label className="flex items-center gap-1.5 text-sm cursor-pointer select-none">
          <input
            type="checkbox"
            checked={forceCenter}
            onChange={(e) => setForceCenter(e.target.checked)}
            className="accent-indigo-500"
          />
          Center
        </label>
        <label className="flex items-center gap-1.5 text-sm cursor-pointer select-none">
          <input
            type="checkbox"
            checked={showDebug}
            onChange={(e) => setShowDebug(e.target.checked)}
            className="accent-red-500"
          />
          Debug
        </label>
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

        {/* Content layer */}
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
            style={{ display: "block", maxWidth: "none", imageRendering: "auto" }}
            draggable={false}
          />
        </div>

        {/* Debug overlays — rendered in viewport space (not transformed) */}
        {showDebug && (
          <svg
            className="absolute inset-0 pointer-events-none"
            width={containerSize.w}
            height={containerSize.h}
            style={{ zIndex: 10 }}
          >
            {/* Image border — red dashed rectangle */}
            <rect
              x={imgLeft}
              y={imgTop}
              width={scaledW}
              height={scaledH}
              fill="none"
              stroke="#ef4444"
              strokeWidth={2}
              strokeDasharray="8 4"
              opacity={0.9}
            />
            {/* Image border corner labels */}
            <text x={imgLeft + 4} y={imgTop + 14} fill="#ef4444" fontSize={11} fontFamily="monospace">
              img(0,0)
            </text>
            <text x={imgRight - 70} y={imgBottom - 4} fill="#ef4444" fontSize={11} fontFamily="monospace">
              img({img.w},{img.h})
            </text>

            {/* Image center — red + */}
            <line x1={imgCenterX - 12} y1={imgCenterY} x2={imgCenterX + 12} y2={imgCenterY} stroke="#ef4444" strokeWidth={2} />
            <line x1={imgCenterX} y1={imgCenterY - 12} x2={imgCenterX} y2={imgCenterY + 12} stroke="#ef4444" strokeWidth={2} />
            <text x={imgCenterX + 6} y={imgCenterY - 6} fill="#ef4444" fontSize={10} fontFamily="monospace">
              img center
            </text>

            {/* Viewport center — green + */}
            <line x1={vpCenterX - 20} y1={vpCenterY} x2={vpCenterX + 20} y2={vpCenterY} stroke="#22c55e" strokeWidth={2} />
            <line x1={vpCenterX} y1={vpCenterY - 20} x2={vpCenterX} y2={vpCenterY + 20} stroke="#22c55e" strokeWidth={2} />
            <text x={vpCenterX + 8} y={vpCenterY - 8} fill="#22c55e" fontSize={10} fontFamily="monospace">
              viewport center
            </text>

            {/* Pinch/touch center — yellow crosshair */}
            {lastPinchCenter && (
              <>
                <line
                  x1={lastPinchCenter.x - 30} y1={lastPinchCenter.y}
                  x2={lastPinchCenter.x + 30} y2={lastPinchCenter.y}
                  stroke="#eab308" strokeWidth={2}
                />
                <line
                  x1={lastPinchCenter.x} y1={lastPinchCenter.y - 30}
                  x2={lastPinchCenter.x} y2={lastPinchCenter.y + 30}
                  stroke="#eab308" strokeWidth={2}
                />
                <circle
                  cx={lastPinchCenter.x} cy={lastPinchCenter.y} r={6}
                  fill="none" stroke="#eab308" strokeWidth={2}
                />
                <text x={lastPinchCenter.x + 10} y={lastPinchCenter.y - 10} fill="#eab308" fontSize={10} fontFamily="monospace">
                  zoom origin ({Math.round(lastPinchCenter.x)},{Math.round(lastPinchCenter.y)})
                </text>
              </>
            )}

            {/* Element position indicator */}
            <text x={4} y={containerSize.h - 6} fill="#94a3b8" fontSize={10} fontFamily="monospace">
              container: {containerSize.w.toFixed(0)}×{containerSize.h.toFixed(0)} | center: {forceCenter ? "on" : "off"} | tx,ty: ({tx.toFixed(0)},{ty.toFixed(0)})
            </text>
          </svg>
        )}
      </div>

      {/* Info bar */}
      {values && (
        <div className="mt-2 rounded-lg border border-gray-200 bg-white px-4 py-2 font-mono text-xs dark:border-gray-700 dark:bg-gray-900">
          <span className="mr-4">Image: {img.w}×{img.h}</span>
          <span className="mr-4">Zoom: {(zoom * 100).toFixed(0)}%</span>
          <span className="mr-4">Scroll: ({values.scrollLeft.toFixed(0)}, {values.scrollTop.toFixed(0)})</span>
          <span className="mr-4">Translate: ({values.translateX.toFixed(0)}, {values.translateY.toFixed(0)})</span>
          <span className="mr-4">Center: {forceCenter ? "locked" : "free"}</span>
        </div>
      )}

      {/* Debug legend */}
      {showDebug && (
        <div className="mt-1 flex flex-wrap gap-4 text-xs">
          <span className="flex items-center gap-1"><span className="inline-block h-3 w-3 rounded-sm bg-red-500" /> Image border & center</span>
          <span className="flex items-center gap-1"><span className="inline-block h-3 w-3 rounded-sm bg-green-500" /> Viewport center</span>
          <span className="flex items-center gap-1"><span className="inline-block h-3 w-3 rounded-sm bg-yellow-500" /> Zoom origin (touch/pinch)</span>
        </div>
      )}
    </section>
  );
}
