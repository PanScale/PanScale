"use client";

import { useState, useCallback } from "react";
import { ScalerView, ZoomControls, ResetButton } from "@scaler/react";
import type { ScalerValues } from "@scaler/core";

const GRID_SIZE = 50;
const CONTENT_WIDTH = 2000;
const CONTENT_HEIGHT = 1500;

function GridContent() {
  const cols = Math.ceil(CONTENT_WIDTH / GRID_SIZE);
  const rows = Math.ceil(CONTENT_HEIGHT / GRID_SIZE);

  return (
    <div style={{ width: CONTENT_WIDTH, height: CONTENT_HEIGHT, position: "relative" }}>
      <svg
        width={CONTENT_WIDTH}
        height={CONTENT_HEIGHT}
        style={{ position: "absolute", inset: 0 }}
      >
        {Array.from({ length: cols + 1 }, (_, i) => (
          <line
            key={`v${i}`}
            x1={i * GRID_SIZE}
            y1={0}
            x2={i * GRID_SIZE}
            y2={CONTENT_HEIGHT}
            stroke="#e5e7eb"
            strokeWidth={1}
          />
        ))}
        {Array.from({ length: rows + 1 }, (_, i) => (
          <line
            key={`h${i}`}
            x1={0}
            y1={i * GRID_SIZE}
            x2={CONTENT_WIDTH}
            y2={i * GRID_SIZE}
            stroke="#e5e7eb"
            strokeWidth={1}
          />
        ))}
      </svg>
      <div
        style={{
          position: "absolute",
          left: 400,
          top: 300,
          width: 200,
          height: 150,
          background: "#3b82f6",
          borderRadius: 12,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "white",
          fontWeight: 600,
          fontSize: 16
        }}
      >
        Card A
      </div>
      <div
        style={{
          position: "absolute",
          left: 800,
          top: 500,
          width: 250,
          height: 180,
          background: "#10b981",
          borderRadius: 12,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "white",
          fontWeight: 600,
          fontSize: 16
        }}
      >
        Card B
      </div>
      <div
        style={{
          position: "absolute",
          left: 300,
          top: 700,
          width: 180,
          height: 120,
          background: "#f59e0b",
          borderRadius: 12,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "white",
          fontWeight: 600,
          fontSize: 16
        }}
      >
        Card C
      </div>
    </div>
  );
}

export function PlaygroundDemo() {
  const [values, setValues] = useState<ScalerValues | null>(null);
  const [zoomForControls, setZoomForControls] = useState(1);

  const handleValuesChange = useCallback((v: ScalerValues) => {
    setValues(v);
    setZoomForControls(v.zoom);
  }, []);

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-4">
        <ZoomControls
          zoom={zoomForControls}
          onZoomIn={() => {}}
          onZoomOut={() => {}}
          style={{ padding: "8px 16px", background: "white", borderRadius: 8, border: "1px solid #e5e7eb" }}
        />
        <ResetButton
          onReset={() => {}}
          style={{ padding: "8px 16px", background: "white", borderRadius: 8, border: "1px solid #e5e7eb", cursor: "pointer" }}
        />
      </div>
      <div style={{ border: "2px solid #e5e7eb", borderRadius: 12, overflow: "hidden" }}>
        <ScalerView
          style={{ width: "100%", height: 600 }}
          zooming
          bouncing
          onValuesChange={handleValuesChange}
        >
          <GridContent />
        </ScalerView>
      </div>
      {values && (
        <div className="rounded-lg border border-gray-200 bg-white p-4 font-mono text-sm dark:border-gray-800 dark:bg-gray-900">
          <div className="grid grid-cols-3 gap-2">
            <div>scrollLeft: {values.scrollLeft.toFixed(1)}</div>
            <div>scrollTop: {values.scrollTop.toFixed(1)}</div>
            <div>zoom: {values.zoom.toFixed(3)}</div>
            <div>translateX: {values.translateX.toFixed(1)}</div>
            <div>translateY: {values.translateY.toFixed(1)}</div>
          </div>
        </div>
      )}
    </div>
  );
}
