/**
 * What the deep chain scenario of the benchmark page measures each library
 * through: a head point, `chainDepth` stages each moving a step towards the
 * stage before it, and a subscriber that receives every point after each move.
 * `scripts/benchmark/run-benchmark.mts` in `apps/synstate-docs` drives these
 * adapters, and synstate's in `../03-deep-chain.synstate.mts`, the same way.
 */
import type { SafeUint } from 'ts-type-forge';

export type Point = Readonly<{ x: number; y: number }>;

export type SpringAdapterCallbacks = Readonly<{
  onEmit: (points: readonly Point[]) => void;
}>;

export type SpringAdapter = Readonly<{
  name: string;
  setup: (chainDepth: SafeUint, callbacks: SpringAdapterCallbacks) => void;
  onMouseMove: (pos: Point) => void;
  cleanup: () => void;
}>;

export type Subscription = Readonly<{
  unsubscribe: () => void;
}>;

export const CANVAS_WIDTH = 500;

export const CANVAS_HEIGHT = 400;

/** How far each stage moves towards the one before it, per move of the head. */
export const SPRING_FACTOR = 0.003;

export const moveToward = (
  current: Point,
  target: Point,
  factor: number,
): Point =>
  ({
    x: current.x + (target.x - current.x) * factor,
    y: current.y + (target.y - current.y) * factor,
  }) as const;
