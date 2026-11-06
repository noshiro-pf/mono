import type { Observable } from '../types/index.mjs';
import { getCurrentScopeInternals } from './current-scope.mjs';

/**
 * `depth`, raised to the floor of the scope the observable is created in
 * (`createScope`'s `after`), so that it updates after the observable that scope
 * was made to follow.
 */
export const atScopeFloor = (depth: number): number => {
  const floor = getCurrentScopeInternals()?.depthFloor ?? 0;

  return Math.max(depth, floor);
};

/**
 * The depth of a child of `parents`: one more than the deepest parent, raised
 * to the scope's floor ({@link atScopeFloor}).
 */
export const childDepth = (parents: readonly Observable<unknown>[]): number =>
  atScopeFloor(1 + maxDepth(parents));

/** The greatest `depth` among `parents`, or 0 when there are none. */
export const maxDepth = (parents: readonly Observable<unknown>[]): number => {
  let mut_max = 0;

  for (const p of parents) {
    if (p.depth > mut_max) {
      mut_max = p.depth;
    }
  }

  return mut_max;
};
