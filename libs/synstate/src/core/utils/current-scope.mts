import type { Scope } from '../types/index.mjs';

/** What a scope owns: an observable, as far as the scope needs to know it. */
export type ScopeMember = Readonly<{
  isCompleted: boolean;
  dispose: () => void;
}>;

/**
 * What a scope holds of a subscription made while it ran: enough to end it on
 * disposal, and to tell whether it has already ended on its own.
 */
export type ScopeSubscription = Readonly<{
  /** Whether it has ended, by `unsubscribe`, completion or the scope. */
  isEnded: boolean;

  /**
   * Ends it. The scope calls it once, on disposal (or at once, when adopted by
   * a disposed scope), and only while it has not ended.
   */
  end: () => void;
}>;

/**
 * The side of a scope the rest of the core talks to, on top of its public face
 * {@link Scope}. Kept out of the public API (`core/utils/**` is excluded from
 * index generation), so that only `createScope` and its siblings decide what a
 * scope owns.
 */
export type ScopeInternals = Scope &
  Readonly<{
    /**
     * The least depth of an observable created in the scope (`createScope`'s
     * `after`, inherited from the parent): 0 when it follows nothing.
     */
    depthFloor: number;

    /** Takes `node` into the scope. */
    adopt: (node: ScopeMember) => void;

    /**
     * Tells the scope that one of the nodes it adopted completed on its own, so
     * that the scope can drop it and keep no reference to it. The node is
     * completed (`isCompleted`) by the time it calls this.
     */
    release: () => void;

    addCleanup: (cleanup: () => void) => void;

    /**
     * Takes `subscription` into the scope, which ends it when disposed. A scope
     * already disposed ends it at once.
     */
    adoptSubscription: (subscription: ScopeSubscription) => void;

    /**
     * Tells the scope that one of its subscriptions ended on its own
     * (`unsubscribe`, completion), so that the scope can drop it. It is ended
     * (`isEnded`) by the time it calls this.
     */
    subscriptionGone: () => void;
  }>;

/**
 * The scope whose `run` is executing. A field rather than a module-level `let`,
 * so that the one place writing it is visibly this object.
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
