import type { CSSProperties } from "react";
import type { ScalerValues, Dimensions } from "@panscale/core";

export interface MinimapProps {
  values: ScalerValues;
  dimensions: Dimensions;
  width?: number;
  height?: number;
  style?: CSSProperties;
  className?: string;
}

export function Minimap({
  values,
  dimensions,
  width = 150,
  height = 100,
  style,
  className
}: MinimapProps) {
  if (dimensions.contentWidth === 0 || dimensions.contentHeight === 0) return null;

  const scaleX = width / dimensions.contentWidth;
  const scaleY = height / dimensions.contentHeight;
  const s = Math.min(scaleX, scaleY);

  const vpWidth = (dimensions.clientWidth / values.zoom) * s;
  const vpHeight = (dimensions.clientHeight / values.zoom) * s;
  const vpLeft = values.scrollLeft * s / values.zoom;
  const vpTop = values.scrollTop * s / values.zoom;

  return (
    <div
      style={{
        position: "relative",
        width,
        height,
        border: "1px solid #ccc",
        background: "#f5f5f5",
        ...style
      }}
      className={className}
    >
      <div
        style={{
          position: "absolute",
          left: vpLeft,
          top: vpTop,
          width: vpWidth,
          height: vpHeight,
          border: "2px solid #007bff",
          background: "rgba(0, 123, 255, 0.1)",
          pointerEvents: "none"
        }}
      />
    </div>
  );
}
