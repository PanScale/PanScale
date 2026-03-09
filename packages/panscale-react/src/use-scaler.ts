import { useCallback, useEffect, useRef, useState } from "react";
import { Scaler, type ScalerOptions, type ScalerValues } from "@panscale/core";
import { createWebScaler, type WebScaler } from "@panscale/web";

export interface UseScalerOptions extends Partial<ScalerOptions> {
  contentWidth?: number;
  contentHeight?: number;
}

export interface UseScalerReturn {
  ref: React.RefObject<HTMLDivElement | null>;
  values: ScalerValues;
  scrollTo: (left: number, top: number, animate?: boolean) => void;
  scrollBy: (dx: number, dy: number, animate?: boolean) => void;
  zoomTo: (level: number, animate?: boolean, originX?: number, originY?: number) => void;
  zoomBy: (factor: number, animate?: boolean, originX?: number, originY?: number) => void;
  setContentSize: (width: number, height: number) => void;
}

const defaultValues: ScalerValues = {
  matrix: { a: 1, b: 0, c: 0, d: 1, e: 0, f: 0 },
  translateX: 0,
  translateY: 0,
  zoom: 1,
  scrollLeft: 0,
  scrollTop: 0
};

export function useScaler(options?: UseScalerOptions): UseScalerReturn {
  const ref = useRef<HTMLDivElement | null>(null);
  const webScalerRef = useRef<WebScaler | null>(null);
  const [values, setValues] = useState<ScalerValues>(defaultValues);
  const optionsRef = useRef(options);
  optionsRef.current = options;

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const opts = optionsRef.current;
    const { contentWidth, contentHeight, ...scalerOpts } = opts ?? {};

    const webScaler = createWebScaler(el, {
      callback: setValues,
      contentWidth,
      contentHeight,
      ...scalerOpts
    });
    webScalerRef.current = webScaler;

    return () => {
      webScaler.destroy();
      webScalerRef.current = null;
    };
  }, []);

  const scrollTo = useCallback((left: number, top: number, animate?: boolean) => {
    webScalerRef.current?.scaler.scrollTo(left, top, animate);
  }, []);

  const scrollBy = useCallback((dx: number, dy: number, animate?: boolean) => {
    webScalerRef.current?.scaler.scrollBy(dx, dy, animate);
  }, []);

  const zoomTo = useCallback((level: number, animate?: boolean, originX?: number, originY?: number) => {
    webScalerRef.current?.scaler.zoomTo(level, animate, originX, originY);
  }, []);

  const zoomBy = useCallback((factor: number, animate?: boolean, originX?: number, originY?: number) => {
    webScalerRef.current?.scaler.zoomBy(factor, animate, originX, originY);
  }, []);

  const setContentSize = useCallback((width: number, height: number) => {
    webScalerRef.current?.updateContentSize(width, height);
  }, []);

  return { ref, values, scrollTo, scrollBy, zoomTo, zoomBy, setContentSize };
}
