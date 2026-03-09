import {
  identity,
  translate,
  scale,
  transform,
  inverse,
  applyToPoint,
  decomposeTSR
} from "transformation-matrix";
import type { Matrix } from "transformation-matrix";

import type {
  ScalerTouch,
  ScalerValues,
  ScalerOptions,
  AnimationProvider,
  PullToRefreshCallbacks,
  Dimensions,
  Position,
  SnapSize
} from "./types";
import { mergeOptions } from "./options";
import { getAnimationProvider } from "./animation";
import { clamp, clampZoom, clampScroll, getScrollBounds, detectAxisLock } from "./constraints";
import { createMomentum, startMomentum, stepMomentum, stopMomentum } from "./physics/momentum";
import { createBounce, startBounce, stepBounce, stopBounce } from "./physics/bounce";
import { snapToPage, snapToGrid } from "./physics/snap";
import {
  createPullToRefresh,
  activatePullToRefresh as activatePTR,
  updatePullToRefresh,
  triggerPullToRefresh,
  finishPullToRefresh as finishPTR,
  deactivatePullToRefresh
} from "./pull-to-refresh";

/** Main Scaler class — runtime-agnostic pan/zoom/scroll engine. */
export class Scaler {
  private readonly options: ScalerOptions;
  private readonly callback: (values: ScalerValues) => void;
  private readonly animProvider: AnimationProvider;

  private matrix: Matrix = identity();
  private dimensions: Dimensions = { clientWidth: 0, clientHeight: 0, contentWidth: 0, contentHeight: 0 };
  private position: Position = { left: 0, top: 0 };
  private snapSize: SnapSize = { width: 0, height: 0 };

  // Touch tracking
  private tracking = false;
  private lastTouches: ScalerTouch[] = [];
  private lastTouchTime = 0;
  private initialTouchLeft = 0;
  private initialTouchTop = 0;
  private initialScrollLeft = 0;
  private initialScrollTop = 0;
  private initialZoom = 1;
  private lockDetected = false;
  private lockX = false;
  private lockY = false;

  // Velocity tracking
  private velocityTrackingPoints: Array<{ x: number; y: number; time: number }> = [];

  // Physics
  private momentum = createMomentum();
  private bounce = createBounce();
  private pullToRefresh = createPullToRefresh();

  // Animation
  private animFrameId: number | null = null;
  private animating = false;
  private animStartScrollLeft = 0;
  private animStartScrollTop = 0;
  private animStartZoom = 1;
  private animTargetScrollLeft = 0;
  private animTargetScrollTop = 0;
  private animTargetZoom = 1;
  private animStartTime = 0;
  private animDuration = 250;

  private destroyed = false;

  private zoomMin: number;
  private zoomMax: number;

  constructor(callback: (values: ScalerValues) => void, options?: Partial<ScalerOptions>) {
    this.options = mergeOptions(options);
    this.callback = callback;
    this.animProvider = getAnimationProvider(this.options.animationProvider);
    this.zoomMin = this.options.minZoom;
    this.zoomMax = this.options.maxZoom;
  }

  /** Set viewport and content dimensions. */
  setDimensions(clientWidth: number, clientHeight: number, contentWidth: number, contentHeight: number): void {
    this.dimensions = { clientWidth, clientHeight, contentWidth, contentHeight };
    this.clampAndPublish();
  }

  /** Set element position in the document. */
  setPosition(left: number, top: number): void {
    this.position = { left, top };
  }

  /** Set snap grid cell size (for snapping mode). */
  setSnapSize(width: number, height: number): void {
    this.snapSize = { width, height };
  }

  /** Scroll to absolute position. */
  scrollTo(left: number, top: number, animate = false): void {
    if (animate && this.options.animating) {
      this.animateScrollTo(left, top, this.getCurrentZoom());
    } else {
      this.setScrollPosition(left, top);
      this.clampAndPublish();
    }
  }

  /** Scroll by relative delta. */
  scrollBy(dx: number, dy: number, animate = false): void {
    const { scrollLeft, scrollTop } = this.getDecomposed();
    this.scrollTo(scrollLeft + dx, scrollTop + dy, animate);
  }

  /** Zoom to absolute level. */
  zoomTo(level: number, animate = false, originX?: number, originY?: number): void {
    const clamped = this.clampZoomValue(level);
    if (animate && this.options.animating) {
      this.animateScrollTo(this.getDecomposed().scrollLeft, this.getDecomposed().scrollTop, clamped);
    } else {
      this.applyZoom(clamped, originX, originY);
      this.clampAndPublish();
    }
  }

  /** Zoom by relative factor. */
  zoomBy(factor: number, animate = false, originX?: number, originY?: number): void {
    this.zoomTo(this.getCurrentZoom() * factor, animate, originX, originY);
  }

  /** Animate to a target scroll position AND zoom level in a single motion. */
  scrollToWithZoom(left: number, top: number, zoom: number, animate = false): void {
    const clamped = this.clampZoomValue(zoom);
    if (animate && this.options.animating) {
      this.animateScrollTo(left, top, clamped);
    } else {
      this.applyZoom(clamped);
      this.setScrollPosition(left, top);
      this.clampAndPublish();
    }
  }

  /** Update zoom bounds at runtime. Re-clamps current zoom if out of bounds. */
  setZoomBounds(min: number, max: number): void {
    this.zoomMin = min;
    this.zoomMax = max;
    this.clampAndPublish();
  }

  /** Fit content to viewport, optionally animated. */
  fitToContent(animate = false): void {
    const { clientWidth, clientHeight, contentWidth, contentHeight } = this.dimensions;
    if (contentWidth === 0 || contentHeight === 0) return;

    const fitZoom = Math.min(clientWidth / contentWidth, clientHeight / contentHeight);
    const clampedZoom = this.clampZoomValue(fitZoom);
    const scaledW = contentWidth * clampedZoom;
    const scaledH = contentHeight * clampedZoom;
    const scrollLeft = -(clientWidth - scaledW) / 2;
    const scrollTop = -(clientHeight - scaledH) / 2;
    this.scrollToWithZoom(scrollLeft, scrollTop, clampedZoom, animate);
  }

  /** Get current decomposed transform values. */
  getValues(): ScalerValues {
    return this.decompose();
  }

  /** Get current dimensions. */
  getDimensions(): Dimensions {
    return { ...this.dimensions };
  }

  /** Handle platform-agnostic touch start. */
  doTouchStart(touches: ScalerTouch[], timeStamp: number): void {
    if (this.destroyed) return;

    this.stopAnimation();
    stopMomentum(this.momentum);
    stopBounce(this.bounce);

    this.tracking = true;
    this.lastTouches = touches.map((t) => ({ pageX: t.pageX, pageY: t.pageY }));
    this.lastTouchTime = timeStamp;
    this.lockDetected = false;
    this.lockX = false;
    this.lockY = false;

    const { scrollLeft, scrollTop } = this.getDecomposed();
    this.initialScrollLeft = scrollLeft;
    this.initialScrollTop = scrollTop;
    this.initialZoom = this.getCurrentZoom();

    if (touches.length === 1) {
      const t = touches[0]!;
      this.initialTouchLeft = t.pageX;
      this.initialTouchTop = t.pageY;
    } else if (touches.length >= 2) {
      const t0 = touches[0]!;
      const t1 = touches[1]!;
      this.initialTouchLeft = (t0.pageX + t1.pageX) / 2;
      this.initialTouchTop = (t0.pageY + t1.pageY) / 2;
    }

    this.velocityTrackingPoints = [{ x: this.initialTouchLeft, y: this.initialTouchTop, time: timeStamp }];
  }

  /** Handle platform-agnostic touch move. */
  doTouchMove(touches: ScalerTouch[], timeStamp: number): void {
    if (this.destroyed || !this.tracking) return;

    let currentTouchLeft: number;
    let currentTouchTop: number;
    let lastMidX: number;
    let lastMidY: number;

    if (touches.length === 1) {
      const t = touches[0]!;
      currentTouchLeft = t.pageX;
      currentTouchTop = t.pageY;
      lastMidX = this.lastTouches[0]?.pageX ?? currentTouchLeft;
      lastMidY = this.lastTouches[0]?.pageY ?? currentTouchTop;
    } else if (touches.length >= 2) {
      const t0 = touches[0]!;
      const t1 = touches[1]!;
      currentTouchLeft = (t0.pageX + t1.pageX) / 2;
      currentTouchTop = (t0.pageY + t1.pageY) / 2;

      // Last midpoint for pan delta
      if (this.lastTouches.length >= 2) {
        const lt0 = this.lastTouches[0]!;
        const lt1 = this.lastTouches[1]!;
        lastMidX = (lt0.pageX + lt1.pageX) / 2;
        lastMidY = (lt0.pageY + lt1.pageY) / 2;
      } else {
        lastMidX = this.lastTouches[0]?.pageX ?? currentTouchLeft;
        lastMidY = this.lastTouches[0]?.pageY ?? currentTouchTop;
      }

      // Pinch zoom
      if (this.options.zooming && this.lastTouches.length >= 2) {
        const lt0 = this.lastTouches[0]!;
        const lt1 = this.lastTouches[1]!;
        const prevDist = Math.sqrt(
          (lt1.pageX - lt0.pageX) ** 2 + (lt1.pageY - lt0.pageY) ** 2
        );
        const curDist = Math.sqrt(
          (t1.pageX - t0.pageX) ** 2 + (t1.pageY - t0.pageY) ** 2
        );
        if (prevDist > 0) {
          const scaleFactor = curDist / prevDist;
          const originX = currentTouchLeft - this.position.left;
          const originY = currentTouchTop - this.position.top;
          this.applyZoom(this.getCurrentZoom() * scaleFactor, originX, originY);
        }
      }
    } else {
      return;
    }

    // Axis locking
    if (!this.lockDetected && this.options.locking) {
      const totalDeltaX = currentTouchLeft - this.initialTouchLeft;
      const totalDeltaY = currentTouchTop - this.initialTouchTop;
      const lock = detectAxisLock(totalDeltaX, totalDeltaY, true);
      if (lock.lockX || lock.lockY) {
        this.lockDetected = true;
        this.lockX = lock.lockX;
        this.lockY = lock.lockY;
      }
    }

    // Pan — use midpoint delta (correct for both 1-finger and 2-finger)
    const deltaX = currentTouchLeft - lastMidX;
    const deltaY = currentTouchTop - lastMidY;

    // For pinch zoom, applyZoom already adjusted the scroll position to keep
    // the origin fixed. We still apply the pan delta so 2-finger drag works.
    const { scrollLeft, scrollTop } = this.getDecomposed();
    let newScrollLeft = scrollLeft;
    let newScrollTop = scrollTop;

    if (this.options.scrollingX && !this.lockX) {
      newScrollLeft -= deltaX;
    }
    if (this.options.scrollingY && !this.lockY) {
      newScrollTop -= deltaY;
    }

    // Bouncing: allow over-scroll with resistance
    const bounds = getScrollBounds(this.dimensions, this.getCurrentZoom());
    if (this.options.bouncing) {
      if (newScrollLeft < bounds.minScrollLeft) {
        newScrollLeft = bounds.minScrollLeft + (newScrollLeft - bounds.minScrollLeft) * 0.5;
      } else if (newScrollLeft > bounds.maxScrollLeft) {
        newScrollLeft = bounds.maxScrollLeft + (newScrollLeft - bounds.maxScrollLeft) * 0.5;
      }
      if (newScrollTop < bounds.minScrollTop) {
        newScrollTop = bounds.minScrollTop + (newScrollTop - bounds.minScrollTop) * 0.5;
      } else if (newScrollTop > bounds.maxScrollTop) {
        newScrollTop = bounds.maxScrollTop + (newScrollTop - bounds.maxScrollTop) * 0.5;
      }
    }

    this.setScrollPosition(newScrollLeft, newScrollTop);

    // Pull-to-refresh
    updatePullToRefresh(this.pullToRefresh, -newScrollTop);

    // Velocity tracking
    this.velocityTrackingPoints.push({ x: currentTouchLeft, y: currentTouchTop, time: timeStamp });
    if (this.velocityTrackingPoints.length > 5) {
      this.velocityTrackingPoints.shift();
    }

    this.lastTouches = touches.map((t) => ({ pageX: t.pageX, pageY: t.pageY }));
    this.lastTouchTime = timeStamp;
    this.publish();
  }

  /** Handle platform-agnostic touch end. */
  doTouchEnd(timeStamp: number): void {
    if (this.destroyed || !this.tracking) return;

    this.tracking = false;

    // Trigger pull-to-refresh
    triggerPullToRefresh(this.pullToRefresh);

    // Calculate velocity
    const { velocityX, velocityY } = this.calculateVelocity(timeStamp);
    const { scrollLeft, scrollTop } = this.getDecomposed();
    const bounds = getScrollBounds(this.dimensions, this.getCurrentZoom());

    // Check if we need to bounce back
    const needsBounceX = scrollLeft < bounds.minScrollLeft || scrollLeft > bounds.maxScrollLeft;
    const needsBounceY = scrollTop < bounds.minScrollTop || scrollTop > bounds.maxScrollTop;

    if (needsBounceX || needsBounceY) {
      const targetX = Math.max(bounds.minScrollLeft, Math.min(scrollLeft, bounds.maxScrollLeft));
      const targetY = Math.max(bounds.minScrollTop, Math.min(scrollTop, bounds.maxScrollTop));
      if (this.options.bouncing) {
        startBounce(this.bounce, scrollLeft, scrollTop, targetX, targetY);
        this.startAnimationLoop();
      } else {
        this.setScrollPosition(targetX, targetY);
        this.clampAndPublish();
      }
      return;
    }

    // Apply momentum
    if (this.options.animating && (Math.abs(velocityX) > 1 || Math.abs(velocityY) > 1)) {
      startMomentum(this.momentum, velocityX, velocityY);
      this.startAnimationLoop();
      return;
    }

    // Snapping
    this.applySnapping();
  }

  /** Handle mouse wheel zoom. */
  doMouseZoom(wheelDelta: number, timeStamp: number, pageX: number, pageY: number): void {
    if (this.destroyed || !this.options.zooming) return;

    const factor = wheelDelta > 0 ? 1.1 : 0.9;
    const originX = pageX - this.position.left;
    const originY = pageY - this.position.top;
    this.applyZoom(this.getCurrentZoom() * factor, originX, originY);
    this.clampAndPublish();
  }

  /** Activate pull-to-refresh. */
  activatePullToRefresh(height: number, callbacks: PullToRefreshCallbacks): void {
    activatePTR(this.pullToRefresh, height, callbacks);
  }

  /** Finish pull-to-refresh (call after refresh completes). */
  finishPullToRefresh(): void {
    finishPTR(this.pullToRefresh);
    this.scrollTo(0, 0, true);
  }

  /** Clean up resources. */
  destroy(): void {
    this.destroyed = true;
    this.stopAnimation();
    stopMomentum(this.momentum);
    stopBounce(this.bounce);
    deactivatePullToRefresh(this.pullToRefresh);
  }

  // --- Private ---

  private decompose(): ScalerValues {
    const d = decomposeTSR(this.matrix);
    return {
      matrix: this.matrix,
      translateX: d.translate.tx,
      translateY: d.translate.ty,
      zoom: d.scale.sx,
      scrollLeft: -d.translate.tx,
      scrollTop: -d.translate.ty,
      isInteracting: this.tracking || this.momentum.active || this.bounce.active
    };
  }

  private getDecomposed() {
    const d = decomposeTSR(this.matrix);
    return {
      scrollLeft: -d.translate.tx,
      scrollTop: -d.translate.ty,
      zoom: d.scale.sx
    };
  }

  private getCurrentZoom(): number {
    const d = decomposeTSR(this.matrix);
    return d.scale.sx;
  }

  private setScrollPosition(scrollLeft: number, scrollTop: number): void {
    const zoom = this.getCurrentZoom();
    this.matrix = transform(
      scale(zoom, zoom),
      translate(-scrollLeft / zoom, -scrollTop / zoom)
    );
  }

  private applyZoom(newZoom: number, originX?: number, originY?: number): void {
    const clamped = this.clampZoomValue(newZoom);
    const { scrollLeft, scrollTop } = this.getDecomposed();
    const currentZoom = this.getCurrentZoom();

    let newScrollLeft = scrollLeft;
    let newScrollTop = scrollTop;

    if (originX !== undefined && originY !== undefined) {
      newScrollLeft = (scrollLeft + originX) * (clamped / currentZoom) - originX;
      newScrollTop = (scrollTop + originY) * (clamped / currentZoom) - originY;
    }

    this.matrix = transform(
      scale(clamped, clamped),
      translate(-newScrollLeft / clamped, -newScrollTop / clamped)
    );
  }

  private clampZoomValue(zoom: number): number {
    return clamp(zoom, this.zoomMin, this.zoomMax);
  }

  private clampAndPublish(): void {
    const { scrollLeft, scrollTop } = this.getDecomposed();
    const zoom = this.getCurrentZoom();
    const clamped = clampScroll(scrollLeft, scrollTop, this.dimensions, zoom);
    this.setScrollPosition(clamped.scrollLeft, clamped.scrollTop);
    this.publish();
  }

  private publish(): void {
    this.callback(this.decompose());
  }

  private calculateVelocity(timeStamp: number): { velocityX: number; velocityY: number } {
    const points = this.velocityTrackingPoints;
    if (points.length < 2) return { velocityX: 0, velocityY: 0 };

    const last = points[points.length - 1]!;
    const first = points[0]!;
    const dt = last.time - first.time;

    if (dt <= 0) return { velocityX: 0, velocityY: 0 };

    return {
      velocityX: -(last.x - first.x) / dt * 16,
      velocityY: -(last.y - first.y) / dt * 16
    };
  }

  private startAnimationLoop(): void {
    if (this.animFrameId !== null) return;

    const tick = () => {
      if (this.destroyed) return;

      let needsFrame = false;

      // Momentum
      if (this.momentum.active) {
        const { deltaX, deltaY } = stepMomentum(this.momentum, this.options.deceleration);
        const { scrollLeft, scrollTop } = this.getDecomposed();
        let newScrollLeft = scrollLeft + deltaX;
        let newScrollTop = scrollTop + deltaY;

        const bounds = getScrollBounds(this.dimensions, this.getCurrentZoom());

        // Check bounds — if exceeded, start bounce
        if (newScrollLeft < bounds.minScrollLeft || newScrollLeft > bounds.maxScrollLeft ||
            newScrollTop < bounds.minScrollTop || newScrollTop > bounds.maxScrollTop) {
          stopMomentum(this.momentum);
          if (this.options.bouncing) {
            const targetX = Math.max(bounds.minScrollLeft, Math.min(newScrollLeft, bounds.maxScrollLeft));
            const targetY = Math.max(bounds.minScrollTop, Math.min(newScrollTop, bounds.maxScrollTop));
            startBounce(this.bounce, newScrollLeft, newScrollTop, targetX, targetY);
          } else {
            newScrollLeft = Math.max(bounds.minScrollLeft, Math.min(newScrollLeft, bounds.maxScrollLeft));
            newScrollTop = Math.max(bounds.minScrollTop, Math.min(newScrollTop, bounds.maxScrollTop));
          }
        }

        this.setScrollPosition(newScrollLeft, newScrollTop);
        this.publish();
        needsFrame = this.momentum.active;
      }

      // Bounce
      if (this.bounce.active) {
        const { scrollLeft, scrollTop } = this.getDecomposed();
        const { newX, newY } = stepBounce(this.bounce, scrollLeft, scrollTop);
        this.setScrollPosition(newX, newY);
        this.publish();
        needsFrame = this.bounce.active;
      }

      // Smooth scroll/zoom animation
      if (this.animating) {
        const elapsed = Date.now() - this.animStartTime;
        const progress = Math.min(1, elapsed / this.animDuration);
        const eased = 1 - (1 - progress) ** 3; // ease-out cubic

        const sl = this.animStartScrollLeft + (this.animTargetScrollLeft - this.animStartScrollLeft) * eased;
        const st = this.animStartScrollTop + (this.animTargetScrollTop - this.animStartScrollTop) * eased;
        const z = this.animStartZoom + (this.animTargetZoom - this.animStartZoom) * eased;

        this.matrix = transform(
          scale(z, z),
          translate(-sl / z, -st / z)
        );
        this.publish();

        if (progress >= 1) {
          this.animating = false;
          this.applySnapping();
        } else {
          needsFrame = true;
        }
      }

      if (needsFrame) {
        this.animFrameId = this.animProvider.requestFrame(tick);
      } else {
        this.animFrameId = null;
        // Final snap after momentum
        if (!this.bounce.active && !this.animating) {
          this.applySnapping();
        }
      }
    };

    this.animFrameId = this.animProvider.requestFrame(tick);
  }

  private stopAnimation(): void {
    if (this.animFrameId !== null) {
      this.animProvider.cancelFrame(this.animFrameId);
      this.animFrameId = null;
    }
    this.animating = false;
  }

  private animateScrollTo(scrollLeft: number, scrollTop: number, zoom: number): void {
    this.stopAnimation();
    stopMomentum(this.momentum);
    stopBounce(this.bounce);

    const { scrollLeft: curSL, scrollTop: curST } = this.getDecomposed();
    this.animStartScrollLeft = curSL;
    this.animStartScrollTop = curST;
    this.animStartZoom = this.getCurrentZoom();
    this.animTargetScrollLeft = scrollLeft;
    this.animTargetScrollTop = scrollTop;
    this.animTargetZoom = zoom;
    this.animStartTime = Date.now();
    this.animating = true;
    this.startAnimationLoop();
  }

  private applySnapping(): void {
    const { scrollLeft, scrollTop } = this.getDecomposed();

    if (this.options.paging) {
      const snapped = snapToPage(scrollLeft, scrollTop, this.dimensions);
      if (snapped.scrollLeft !== scrollLeft || snapped.scrollTop !== scrollTop) {
        this.animateScrollTo(snapped.scrollLeft, snapped.scrollTop, this.getCurrentZoom());
        return;
      }
    }

    if (this.options.snapping && this.snapSize.width > 0 && this.snapSize.height > 0) {
      const snapped = snapToGrid(scrollLeft, scrollTop, this.snapSize);
      if (snapped.scrollLeft !== scrollLeft || snapped.scrollTop !== scrollTop) {
        this.animateScrollTo(snapped.scrollLeft, snapped.scrollTop, this.getCurrentZoom());
        return;
      }
    }

    this.clampAndPublish();
  }
}
