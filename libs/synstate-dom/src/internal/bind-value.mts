import { isObservable } from 'synstate';
import type { Bindable } from '../constant/index.mjs';
import { subscribeInScope } from '../scope/index.mjs';

/**
 * Writes the value of a {@link Bindable} with `write`, and again on every update
 * (SPEC.md 7.1).
 *
 * - A constant is written once.
 * - A completed observable has its current value written once.
 * - Any other observable is subscribed to, and the subscription is released
 *   when the current scope is disposed.
 *
 * `subscribe` delivers the current value before it adds the subscriber, so a
 * value written by the first `write` itself (a `For` row or a switch branch
 * mounted then writes what chose it, #3141) reaches no subscriber; it is
 * written once the subscription is in place.
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

  const { updateToken } = bindable;

  subscribeInScope(bindable, write);

  if (bindable.updateToken !== updateToken) {
    write(bindable.getSnapshot().value);
  }
};
