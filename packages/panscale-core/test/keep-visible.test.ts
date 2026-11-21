import { describe, expect, it } from "vitest";
import type { ScalerOptions, ScalerValues } from "../src";
import { Scaler } from "../src";

// A 100 × 100 content in a 600 × 600 viewport: the case where the default bounds slide a zoom
// around a point near an edge.
const CLIENT = 600;
const CONTENT = 100;

function makeScaler(options: Partial<ScalerOptions> = {}) {
  let last: ScalerValues | null = null;
  const scaler = new Scaler(
    (v) => {
      last = v;
    },
    { zooming: true, bouncing: false, minZoom: 0.5, maxZoom: 12, ...options }
  );
  scaler.setPosition(0, 0);
  scaler.setDimensions(CLIENT, CLIENT, CONTENT, CONTENT);
  const values = () => {
    if (last === null) throw new Error("nothing published");
    return last;
  };
  return { scaler, values };
}

const keepVisible = { bounds: { kind: "keepVisible", minVisible: 48 } } as const;

/** The content point (in unscaled content units) at viewport point (`x`, `y`). */
const under = (v: ScalerValues, x: number, y: number) => ({
  x: (v.scrollLeft + x) / v.zoom,
  y: (v.scrollTop + y) / v.zoom
});

/** How far, in viewport pixels, content point `p` is from viewport point (`x`, `y`). */
const drift = (v: ScalerValues, p: { x: number; y: number }, x: number, y: number) =>
  Math.hypot(p.x * v.zoom - v.scrollLeft - x, p.y * v.zoom - v.scrollTop - y);

/** How many pixels of the content the viewport shows on each axis. */
const shown = (v: ScalerValues) => {
  const axis = (scroll: number) =>
    Math.max(0, Math.min(CLIENT, CONTENT * v.zoom - scroll) - Math.max(0, -scroll));
  return { x: axis(v.scrollLeft), y: axis(v.scrollTop) };
};

const EDGES = [
  ["left", -1e6, 0],
  ["right", 1e6, 0],
  ["top", 0, -1e6],
  ["bottom", 0, 1e6]
] as const;

/** Zoomed to 6 (the content fills the viewport), then panned as far as the bounds let it go. */
function atEdge(options: Partial<ScalerOptions>, dx: number, dy: number, zoom = 6) {
  const made = makeScaler(options);
  made.scaler.scrollToWithZoom(0, 0, zoom);
  made.scaler.scrollBy(dx, dy);
  return made;
}

/** Wheel steps at (`x`, `y`) until the zoom passes `target`: the drift of the point first under it. */
function wheelTo(scaler: Scaler, values: () => ScalerValues, target: number, x: number, y: number) {
  const first = under(values(), x, y);
  const delta = target > values().zoom ? 1 : -1;
  let worst = 0;
  for (let i = 0; i < 80 && (delta > 0 ? values().zoom < target : values().zoom > target); i += 1) {
    const before = values().zoom;
    scaler.doMouseZoom(delta, 0, x, y);
    if (values().zoom === before) break;
    worst = Math.max(worst, drift(values(), first, x, y));
  }
  return worst;
}

describe("the default bounds are unchanged", () => {
  it("still contains the content, and so slides a wheel out near an edge", () => {
    const { scaler, values } = atEdge({}, -1e6, 0, 12);
    expect(values().scrollLeft).toBeCloseTo(0, 6);
    expect(wheelTo(scaler, values, 6, 300, 300)).toBeGreaterThan(100);
  });
});

describe("keepVisible bounds", () => {
  for (const [edge, dx, dy] of EDGES) {
    it(`stops a pan ${edge} with minVisible pixels of the content in view`, () => {
      const { values } = atEdge(keepVisible, dx, dy);
      const s = shown(values());
      expect(Math.min(s.x, s.y)).toBeCloseTo(48, 6);
    });

    it(`keeps the point under the cursor on a wheel out after panning ${edge}, to the least zoom`, () => {
      const { scaler, values } = atEdge(keepVisible, dx, dy);
      expect(wheelTo(scaler, values, 3, 300, 300)).toBeLessThan(0.5);
      expect(wheelTo(scaler, values, 0, 599, 1)).toBeLessThan(0.5);
      expect(values().zoom).toBeCloseTo(0.5, 6);
      const s = shown(values());
      expect(Math.min(s.x, s.y)).toBeGreaterThan(0);
    });

    it(`keeps the point between the fingers on a pinch out after panning ${edge}`, () => {
      const { scaler, values } = atEdge(keepVisible, dx, dy);
      const p = under(values(), 300, 300);
      const at = (spread: number) => [
        { pageX: 300 - spread, pageY: 300 },
        { pageX: 300 + spread, pageY: 300 }
      ];
      scaler.doTouchStart(at(140), 0);
      for (let i = 1; i <= 8; i += 1) scaler.doTouchMove(at(140 - 10 * i), 16 * i);
      scaler.doTouchMove(at(60), 1000);
      scaler.doTouchEnd(1200);
      expect(values().zoom).toBeLessThan(6);
      expect(drift(values(), p, 300, 300)).toBeLessThan(0.5);
    });

    it(`keeps the content in view before the point on a wheel in off the content after panning ${edge}`, () => {
      const { scaler, values } = atEdge(keepVisible, dx, dy, 3);
      // The viewport corner furthest from the content.
      const s0 = values();
      const x = s0.scrollLeft < 0 ? 1 : 599;
      const y = s0.scrollTop < 0 ? 1 : 599;
      const slid = wheelTo(scaler, values, 12, x, y);
      expect(slid).toBeGreaterThan(5);
      const s = shown(values());
      expect(Math.min(s.x, s.y)).toBeGreaterThanOrEqual(48 - 1e-6);
    });
  }

  it("keeps the point under the cursor at the zoom bounds", () => {
    const { scaler, values } = atEdge(keepVisible, -1e6, 0);
    wheelTo(scaler, values, 100, 300, 300);
    expect(values().zoom).toBeCloseTo(12, 6);
    const p = under(values(), 300, 300);
    scaler.doMouseZoom(1, 0, 300, 300);
    expect(drift(values(), p, 300, 300)).toBeLessThan(0.5);
  });

  it("shows the whole content when it is smaller on screen than minVisible", () => {
    const { scaler, values } = makeScaler({ ...keepVisible, minZoom: 0.3 });
    scaler.scrollToWithZoom(0, 0, 0.4);
    scaler.scrollBy(1e6, 1e6);
    const s = shown(values());
    expect(s.x).toBeCloseTo(CONTENT * values().zoom, 6);
    expect(s.y).toBeCloseTo(CONTENT * values().zoom, 6);
  });
});
