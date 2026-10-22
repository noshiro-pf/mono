import type { Scope } from '../types/index.mjs';

/** What a scope owns: an observable, as far as the scope needs to know it. */
export type ScopeMember = Readonly<{
  isCompleted: boolean;
  dispose: () => void;
}>;

/**
 * The side of a scope the rest of the core talks to, on top of its public
 * face {@link Scope}. Kept out of the public API (`core/utils/**` is excluded
 * from index generation), so that only `createScope` and its siblings decide
 * what a scope owns.
 */
export type ScopeInternals = Scope &
  Readonly<{
    /** Takes `node` into the scope. */
    adopt: (node: ScopeMember) => void;

    /**
     * Tells the scope that one of the nodes it adopted completed on its own,
     * so that the scope can drop it and keep no reference to it. The node is
     * completed (`isCompleted`) by the time it calls this.
     */
    release: () => void;

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
