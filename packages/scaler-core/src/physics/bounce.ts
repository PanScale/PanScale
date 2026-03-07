/** Elastic spring-back at edges. */

const SPRING_STIFFNESS = 0.15;
const SPRING_DAMPING = 0.75;

export interface BounceState {
  active: boolean;
  targetX: number;
  targetY: number;
  velocityX: number;
  velocityY: number;
}

export function createBounce(): BounceState {
  return { active: false, targetX: 0, targetY: 0, velocityX: 0, velocityY: 0 };
}

export function startBounce(
  state: BounceState,
  currentX: number,
  currentY: number,
  targetX: number,
  targetY: number
): void {
  state.targetX = targetX;
  state.targetY = targetY;
  state.velocityX = 0;
  state.velocityY = 0;
  state.active = Math.abs(currentX - targetX) > 0.5 || Math.abs(currentY - targetY) > 0.5;
}

export function stepBounce(
  state: BounceState,
  currentX: number,
  currentY: number
): { newX: number; newY: number } {
  if (!state.active) return { newX: currentX, newY: currentY };

  const dx = state.targetX - currentX;
  const dy = state.targetY - currentY;

  state.velocityX = (state.velocityX + dx * SPRING_STIFFNESS) * SPRING_DAMPING;
  state.velocityY = (state.velocityY + dy * SPRING_STIFFNESS) * SPRING_DAMPING;

  const newX = currentX + state.velocityX;
  const newY = currentY + state.velocityY;

  if (
    Math.abs(newX - state.targetX) < 0.5 &&
    Math.abs(newY - state.targetY) < 0.5 &&
    Math.abs(state.velocityX) < 0.1 &&
    Math.abs(state.velocityY) < 0.1
  ) {
    state.active = false;
    return { newX: state.targetX, newY: state.targetY };
  }

  return { newX, newY };
}

export function stopBounce(state: BounceState): void {
  state.active = false;
  state.velocityX = 0;
  state.velocityY = 0;
}
