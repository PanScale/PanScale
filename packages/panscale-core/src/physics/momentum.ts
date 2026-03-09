/** Deceleration animation for momentum scrolling after touch-end. */
export interface MomentumState {
  velocityX: number;
  velocityY: number;
  active: boolean;
}

export function createMomentum(): MomentumState {
  return { velocityX: 0, velocityY: 0, active: false };
}

export function startMomentum(
  state: MomentumState,
  velocityX: number,
  velocityY: number
): void {
  state.velocityX = velocityX;
  state.velocityY = velocityY;
  state.active = Math.abs(velocityX) > 0.1 || Math.abs(velocityY) > 0.1;
}

export function stepMomentum(
  state: MomentumState,
  deceleration: number
): { deltaX: number; deltaY: number } {
  if (!state.active) return { deltaX: 0, deltaY: 0 };

  const deltaX = state.velocityX;
  const deltaY = state.velocityY;

  state.velocityX *= deceleration;
  state.velocityY *= deceleration;

  if (Math.abs(state.velocityX) < 0.1 && Math.abs(state.velocityY) < 0.1) {
    state.velocityX = 0;
    state.velocityY = 0;
    state.active = false;
  }

  return { deltaX, deltaY };
}

export function stopMomentum(state: MomentumState): void {
  state.velocityX = 0;
  state.velocityY = 0;
  state.active = false;
}
