/**
 * The state of the update propagating now, shared by every observable.
 *
 * It is module state rather than a field of a class, so that nothing outside
 * this file can reach it but through the functions below: an exported class
 * would hand its static fields to every importer, and a private static field
 * costs about twice as much per access as a module binding, on a path every
 * update takes.
 */
import { Arr } from 'ts-data-forge';
import type { UpdateToken } from '../types/index.mjs';

/**
 * How many `startUpdate` calls are running, across every observable, and
 * the token of the outermost one.
 */
const mut_propagation: {
  depth: number;
  outermostToken: UpdateToken | undefined;
} = { depth: 0, outermostToken: undefined };

/**
 * Work deferred by {@link runAfterPropagation}, run once the outermost
 * `startUpdate` has reached every descendant.
 */
const mut_afterPropagation: (() => void)[] = [];

/**
 * Whether some observable's update is propagating right now. A root written
 * to while one is, is written to from inside a subscriber or a projection
 * (#2336).
 */
export const isPropagating = (): boolean => mut_propagation.depth > 0;

/** The token of the outermost update propagating now, if any. */
export const outermostUpdateToken = (): UpdateToken | undefined =>
  mut_propagation.outermostToken;

/**
 * Runs `task` once the update now propagating has reached every descendant, or
 * at once when none is. A child that completes itself in its `tryUpdate`
 * completes its children with it, before they have seen the value it has just
 * passed on (`take`).
 */
export const runAfterPropagation = (task: () => void): void => {
  if (isPropagating()) {
    mut_afterPropagation.push(task);
  } else {
    task();
  }
};

/** Brackets one `startUpdate`; see {@link endPropagation}. */
export const beginPropagation = (updateToken: UpdateToken): void => {
  if (mut_propagation.depth === 0) {
    mut_propagation.outermostToken = updateToken;
  }

  mut_propagation.depth += 1;
};

/**
 * Ends one `startUpdate`, and runs the deferred work once the outermost one
 * has ended.
 */
export const endPropagation = (): void => {
  mut_propagation.depth -= 1;

  if (mut_propagation.depth > 0) {
    return;
  }

  mut_propagation.outermostToken = undefined;

  // A deferred task may start an update of its own, which flushes what that
  // update defers before this loop moves on.
  while (Arr.isNonEmpty(mut_afterPropagation)) {
    mut_afterPropagation.shift()?.();
  }
};
