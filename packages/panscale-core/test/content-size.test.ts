import { describe, expect, it } from "vitest";
import type { ScalerValues } from "../src";
import { Scaler } from "../src";

function makeScaler() {
  let last: ScalerValues | null = null;
  const scaler = new Scaler((v) => {
    last = v;
  });
  return { scaler, values: () => last as ScalerValues };
}

describe("Scaler.setContentSize", () => {
  it("lets the scroll range follow a content size that grows after creation", () => {
    const { scaler, values } = makeScaler();
    scaler.setDimensions(400, 300, 400, 300);
    scaler.scrollTo(1000, 0, false);
    expect(values().scrollLeft).toBeCloseTo(0);

    scaler.setContentSize(1400, 300);
    scaler.scrollTo(1000, 0, false);
    expect(values().scrollLeft).toBe(1000);
  });

  it("keeps the viewport size from setDimensions", () => {
    const { scaler, values } = makeScaler();
    scaler.setDimensions(400, 300, 1400, 300);
    scaler.setContentSize(800, 300);
    scaler.scrollTo(5000, 0, false);
    // content 800 wide in a 400 wide viewport: the maximum scroll is 400
    expect(values().scrollLeft).toBe(400);
  });

  it("clamps an existing scroll position when the content shrinks", () => {
    const { scaler, values } = makeScaler();
    scaler.setDimensions(400, 300, 1400, 300);
    scaler.scrollTo(1000, 0, false);
    scaler.setContentSize(600, 300);
    expect(values().scrollLeft).toBe(200);
  });
});
