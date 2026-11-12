import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { ScalerValues } from "@panscale/core";
import { createWebScaler } from "../src";

type ResizeCallback = (entries: { contentRect: { width: number; height: number } }[]) => void;

class FakeResizeObserver {
  static instances: FakeResizeObserver[] = [];
  constructor(readonly callback: ResizeCallback) {
    FakeResizeObserver.instances.push(this);
  }
  observe() {}
  disconnect() {}
  fire(width: number, height: number) {
    this.callback([{ contentRect: { width, height } }]);
  }
}

class FakeElement {
  scrollWidth = 0;
  scrollHeight = 0;
  viewport = { width: 400, height: 300 };
  getBoundingClientRect() {
    return { left: 0, top: 0, width: this.viewport.width, height: this.viewport.height };
  }
  addEventListener() {}
  removeEventListener() {}
  style: Record<string, string> = {};
}

beforeEach(() => {
  FakeResizeObserver.instances = [];
  vi.stubGlobal("ResizeObserver", FakeResizeObserver);
  vi.stubGlobal("document", { addEventListener() {}, removeEventListener() {} });
  vi.stubGlobal("window", { scrollX: 0, scrollY: 0, addEventListener() {}, removeEventListener() {} });
});

afterEach(() => {
  vi.unstubAllGlobals();
});

function setup(contentWidth: number, contentHeight: number) {
  let last: ScalerValues | null = null;
  const element = new FakeElement();
  const web = createWebScaler(element as unknown as HTMLElement, {
    callback: (v) => {
      last = v;
    },
    contentWidth,
    contentHeight
  });
  const observer = FakeResizeObserver.instances[0]!;
  return { element, web, observer, values: () => last as ScalerValues };
}

describe("createWebScaler content size", () => {
  it("keeps a content size set by updateContentSize across a resize", () => {
    const { element, web, observer, values } = setup(400, 300);

    web.updateContentSize(1400, 300);
    web.scaler.scrollTo(1000, 0, false);
    expect(values().scrollLeft).toBe(1000);

    element.viewport = { width: 420, height: 300 };
    observer.fire(420, 300);

    // The scroll is held at the new maximum, 1400 - 420. Before the fix the
    // resize handler read the size given at creation (400) and clamped to 0.
    expect(values().scrollLeft).toBe(980);
  });

  it("uses the new size to bound the scroll after a resize", () => {
    const { element, web, observer, values } = setup(400, 300);
    web.updateContentSize(1400, 300);
    element.viewport = { width: 500, height: 300 };
    observer.fire(500, 300);
    web.scaler.scrollTo(5000, 0, false);
    expect(values().scrollLeft).toBe(900);
  });
});
