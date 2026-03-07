import type { CSSProperties } from "react";

export interface ZoomControlsProps {
  zoom: number;
  onZoomIn: () => void;
  onZoomOut: () => void;
  style?: CSSProperties;
  className?: string;
}

export function ZoomControls({ zoom, onZoomIn, onZoomOut, style, className }: ZoomControlsProps) {
  return (
    <div
      style={{ display: "flex", alignItems: "center", gap: 8, ...style }}
      className={className}
    >
      <button onClick={onZoomOut} aria-label="Zoom out" type="button">
        −
      </button>
      <span>{Math.round(zoom * 100)}%</span>
      <button onClick={onZoomIn} aria-label="Zoom in" type="button">
        +
      </button>
    </div>
  );
}
