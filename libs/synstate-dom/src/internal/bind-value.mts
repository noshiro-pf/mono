import { isObservable } from 'synstate';
import type { Bindable } from '../constant/index.mjs';

/**
 * Writes the value of a {@link Bindable} with `write`, and again on every update
 * (SPEC.md 7.1).
 *
 * - A constant is written once.
 * - A completed observable has its current value written once.
 * - Any other observable is subscribed to in the current scope, whose disposal
 *   ends the subscription.
 *
 * A value written by the first `write` itself (a `For` row or a switch branch
 * mounted then writes what chose it, #3141) is written again by `subscribe`,
 * once the first call has returned.
 */
export const bindValue = <T,>(
  bindable: Bindable<T>,
  write: (value: T) => void,
): void => {
  if (!isObservable(bindable)) {
    write(bindable);

    return;
  }

  if (bindable.isCompleted) {
    write(bindable.getSnapshot().value);

    return;
  }

  bindable.subscribe(write);
};
