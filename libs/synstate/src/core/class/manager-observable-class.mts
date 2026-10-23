// @sumi-expect-error-file classes/no-class
// @sumi-expect-error-file banned-syntax/no-this
// @sumi-expect-error-file functions/prefer-arrow-function
import type { ManagerObservableKind } from '../types/index.mjs';
import { ObservableBaseClass } from './observable-base-class.mjs';
import {
  beginPropagation,
  closeUpdate,
  drainUpdate,
  endPropagation,
  openUpdate,
} from './propagation-state.mjs';

/**
 * The base of the observables that start updates of their own: a root, and
 * an async child (`debounce`, `switchMap`), which emits later than its
 * parents do. Its update visits, shallowest first, the nodes its value
 * reaches: each node that emits puts its children in the update's queue
 * (`propagation-state.mts`), so that each sees its parents' values of that
 * update (no glitch) and a node no value reached is not visited.
 */
export class ManagerObservableClass<
  A,
  Kind extends ManagerObservableKind,
  Depth extends number,
> extends ObservableBaseClass<A, Kind, Depth> {
  /** Emits `nextValue` and propagates it to the descendants. */
  protected startUpdate(nextValue: A): void {
    const updateToken = openUpdate(this.depth);

    beginPropagation(updateToken);

    // A subscriber or projection may throw, and the depth has to come back
    // down regardless, or every later write would warn. The exception itself
    // is not caught: it reaches the caller of `next` as it always has.
    // @sumi-expect-error exceptions/no-try
    try {
      this.setNext(nextValue, updateToken);

      drainUpdate(updateToken);
    } finally {
      closeUpdate(updateToken);

      endPropagation();
    }
  }
}
