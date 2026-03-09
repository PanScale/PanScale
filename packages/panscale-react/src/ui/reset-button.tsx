import type { CSSProperties } from "react";

export interface ResetButtonProps {
  onReset: () => void;
  style?: CSSProperties;
  className?: string;
  label?: string;
}

export function ResetButton({ onReset, style, className, label = "1:1" }: ResetButtonProps) {
  return (
    <button
      onClick={onReset}
      style={style}
      className={className}
      aria-label="Reset zoom"
      type="button"
    >
      {label}
    </button>
  );
}
