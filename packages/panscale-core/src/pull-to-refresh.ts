import type { PullToRefreshCallbacks, PullToRefreshState } from "./types";

export interface PullToRefreshManager {
  state: PullToRefreshState;
  height: number;
  callbacks: PullToRefreshCallbacks | null;
  active: boolean;
}

export function createPullToRefresh(): PullToRefreshManager {
  return {
    state: "idle",
    height: 0,
    callbacks: null,
    active: false
  };
}

export function activatePullToRefresh(
  manager: PullToRefreshManager,
  height: number,
  callbacks: PullToRefreshCallbacks
): void {
  manager.height = height;
  manager.callbacks = callbacks;
  manager.active = true;
  manager.state = "idle";
}

export function updatePullToRefresh(
  manager: PullToRefreshManager,
  scrollTop: number
): void {
  if (!manager.active || !manager.callbacks) return;

  const pullDistance = -scrollTop;

  switch (manager.state) {
    case "idle":
      if (pullDistance > 0) {
        manager.state = "pulling";
      }
      break;
    case "pulling":
      if (pullDistance >= manager.height) {
        manager.state = "active";
        manager.callbacks.onActivate();
      } else if (pullDistance <= 0) {
        manager.state = "idle";
      }
      break;
    case "active":
      if (pullDistance < manager.height) {
        manager.state = "pulling";
        manager.callbacks.onDeactivate();
      }
      break;
    case "refreshing":
      break;
  }
}

export function triggerPullToRefresh(manager: PullToRefreshManager): void {
  if (!manager.active || !manager.callbacks) return;

  if (manager.state === "active") {
    manager.state = "refreshing";
    manager.callbacks.onStart();
  }
}

export function finishPullToRefresh(manager: PullToRefreshManager): void {
  if (!manager.active) return;
  manager.state = "idle";
}

export function deactivatePullToRefresh(manager: PullToRefreshManager): void {
  manager.active = false;
  manager.callbacks = null;
  manager.state = "idle";
  manager.height = 0;
}
