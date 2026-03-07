import { type CSSProperties, type ReactNode, useCallback, useEffect, useRef } from "react";
import type { ScalerOptions, ScalerValues } from "@scaler/core";
import { useScaler } from "./use-scaler";

export interface ScalerViewProps {
  children?: ReactNode;
  style?: CSSProperties;
  className?: string;
  options?: Partial<ScalerOptions>;
  zooming?: boolean;
  bouncing?: boolean;
  paging?: boolean;
  snapping?: boolean;
  onValuesChange?: (values: ScalerValues) => void;
}

export function ScalerView({
  children,
  style,
  className,
  options,
  zooming,
  bouncing,
  paging,
  snapping,
  onValuesChange
}: ScalerViewProps) {
  const mergedOptions: Partial<ScalerOptions> = {
    ...options,
    ...(zooming !== undefined ? { zooming } : {}),
    ...(bouncing !== undefined ? { bouncing } : {}),
    ...(paging !== undefined ? { paging } : {}),
    ...(snapping !== undefined ? { snapping } : {})
  };

  const { ref, values } = useScaler(mergedOptions);
  const prevValuesRef = useRef(values);

  useEffect(() => {
    if (onValuesChange && values !== prevValuesRef.current) {
      prevValuesRef.current = values;
      onValuesChange(values);
    }
  }, [values, onValuesChange]);

  return (
    <div
      ref={ref}
      style={{ overflow: "hidden", position: "relative", ...style }}
      className={className}
    >
      <div
        style={{
          transform: `translate(${values.translateX}px, ${values.translateY}px) scale(${values.zoom})`,
          transformOrigin: "0 0",
          willChange: "transform"
        }}
      >
        {children}
      </div>
    </div>
  );
}
