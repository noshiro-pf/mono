/**
 * Whether an animation is running smoothly enough to go on, judged by the
 * time between its frames. A device that cannot keep up — a large graph, a
 * slow phone, a busy tab — is better served by the end state at once than by
 * a slide show: the placement animation (`dag-layout-store.mts`) stops and
 * puts every node in its place when the budget is exceeded, whatever the
 * reader's animation setting.
 *
 * Fed the time the animation started and then the time of each frame. The
 * first interval, from the start to the first frame, is not counted: it
 * includes rendering the first positions, which is the setup, not the
 * animation.
 */

import { Num } from 'ts-data-forge';

/**
 * The longest average interval between frames that is smooth enough: a
 * little over 1000 / 30, so a steady 30 fps passes and anything slower does
 * not.
 */
export const FRAME_BUDGET_AVERAGE_MS = 34;

/**
 * The longest any one interval may be: a frame this late is a visible stall
 * however fast the others are.
 */
export const FRAME_BUDGET_SINGLE_MS = 100;

/**
 * The frames before the average is judged, so that one slow interval right
 * after the start does not decide it alone.
 */
export const FRAME_BUDGET_FRAMES_BEFORE_AVERAGE = 3;

export type FrameBudget = Readonly<{
  /** When the last frame was, or the start before the first. */
  lastAt: number;
  /** How many frames there have been. */
  frames: number;
  /** The intervals counted — all but the first — added up. */
  countedMs: number;
  /** The longest interval counted. */
  longestMs: number;
}>;

/** The budget of an animation that started `at`. */
export const startFrameBudget = (at: number): FrameBudget =>
  ({
    lastAt: at,
    frames: 0,
    countedMs: 0,
    longestMs: 0,
  }) as const;

/** `budget` after a frame `at`. */
export const recordFrame = (budget: FrameBudget, at: number): FrameBudget => {
  const interval = at - budget.lastAt;

  // The first interval includes the setup.
  const counted = budget.frames === 0 ? 0 : interval;

  return {
    lastAt: at,
    frames: budget.frames + 1,
    countedMs: budget.countedMs + counted,
    longestMs: Math.max(budget.longestMs, counted),
  };
};

/** Whether the frames so far are too slow to go on. */
export const isOverFrameBudget = (budget: FrameBudget): boolean => {
  if (budget.longestMs > FRAME_BUDGET_SINGLE_MS) {
    return true;
  }

  if (budget.frames < FRAME_BUDGET_FRAMES_BEFORE_AVERAGE) {
    return false;
  }

  // At least two intervals are counted by now.
  const countedIntervals = budget.frames - 1;

  return (
    Num.isNonZero(countedIntervals) &&
    Num.div(budget.countedMs, countedIntervals) > FRAME_BUDGET_AVERAGE_MS
  );
};
