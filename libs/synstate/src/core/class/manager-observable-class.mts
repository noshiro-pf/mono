// @sumi-expect-error-file classes/no-class
// @sumi-expect-error-file banned-syntax/no-this
// @sumi-expect-error-file functions/prefer-arrow-function
import type { ManagerObservableKind } from '../types/index.mjs';
import { getCurrentScopeInternals, runWithScope } from '../utils/index.mjs';
import { ObservableBaseClass } from './observable-base-class.mjs';
import {
  beginPropagation,
  closeUpdate,
  drainUpdate,
  endPropagation,
  openUpdate,
} from './propagation-state.mjs';

/**
 * The base of the observables that start updates of their own: a root, and an
 * async child (`debounce`, `switchMap`), which emits later than its parents do.
 * Its update visits, shallowest first, the nodes its value reaches: each node
 * that emits puts its children in the update's queue (`propagation-state.mts`),
 * so that each sees its parents' values of that update (no glitch) and a node
 * no value reached is not visited.
 */
export class ManagerObservableClass<
  A,
  Kind extends ManagerObservableKind,
  Depth extends number,
> extends ObservableBaseClass<A, Kind, Depth> {
  /** Opens the update for `nextValue`, runs it and closes it. */
  #propagate(nextValue: A): void {
    const updateToken = openUpdate(this.depth);

    beginPropagation(updateToken);

    // A subscriber or projection may throw, and the depth has to come back down
    // regardless, or every later write would warn. The exception itself is not
    // caught: it reaches the caller of `next` as it always has.
    // @sumi-expect-error exceptions/no-try
    try {
      this.setNext(nextValue, updateToken);

      drainUpdate(updateToken);
    } finally {
      closeUpdate(updateToken);

      endPropagation();
    }
  }
  /**
   * Emits `nextValue` and propagates it to the descendants; does nothing once
   * the observable has completed.
   */
  protected startUpdate(nextValue: A): void {
    // A completed observable emits nothing more, whatever still calls this: a
    // subscribable that goes on after `unsubscribe`, a callback queued before
    // the completion. Its children may be live, under other parents. `setNext`
    // checks too, but `setNextIfUnobserved` below does not, and this check also
    // keeps the update from being opened. The call is ignored rather than
    // reported, as `source.next` ignores one after completion: a source that
    // cannot be stopped at once calls late with nothing wrong.
    if (this.isCompleted) {
      return;
    }

    // Nothing to propagate to (a branch no `switchMap` follows, a state written
    // before anything subscribes): the update is the value alone, and opening
    // one would cost more than storing it.
    if (this.setNextIfUnobserved(nextValue)) {
      return;
    }

    // An update runs in no scope, whichever one is running when it starts: what
    // a subscriber or projection subscribes or creates belongs to whoever owns
    // that code, not to a component that happened to write the value.
    if (getCurrentScopeInternals() === undefined) {
      this.#propagate(nextValue);
    } else {
      runWithScope(undefined, () => {
        this.#propagate(nextValue);
      });
    }
  }
}
