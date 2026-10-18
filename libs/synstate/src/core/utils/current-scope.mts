import type { Scope } from '../types/index.mjs';

/**
 * The side of a scope the rest of the core talks to; {@link Scope} is the
 * public face of the same object. Kept out of the public API (`core/utils/**`
 * is excluded from index generation), so that only `createScope` and its
 * siblings decide what a scope owns.
 */
export type ScopeInternals = Readonly<{
  scope: Scope;

  /**
   * Takes `node` into the scope and returns the function that releases it
   * again, which a node calls when it completes on its own so that the scope
   * keeps no reference to it.
   */
  adopt: (node: Readonly<{ dispose: () => void }>) => () => void;

  addCleanup: (cleanup: () => void) => void;
}>;

/**
 * The scope whose `run` is executing. A field rather than a module-level
 * `let`, so that the one place writing it is visibly this object.
 */
const mut_slot: { current: ScopeInternals | undefined } = {
  current: undefined,
};

export const getCurrentScopeInternals = (): ScopeInternals | undefined =>
  mut_slot.current;

/**
 * Calls `body` with `scope` as the current scope (`undefined`: none) and
 * restores the previous one afterwards, also when `body` throws.
 */
export const runWithScope = <R,>(
  scope: ScopeInternals | undefined,
  body: () => R,
): R => {
  const prev = mut_slot.current;

  mut_slot.current = scope;

  // `finally` is the point: an exception from `body` must not leave its scope
  // current for whatever runs next. Nothing is caught.
  // @sumi-expect-error exceptions/no-try
  try {
    return body();
  } finally {
    mut_slot.current = prev;
  }
};
