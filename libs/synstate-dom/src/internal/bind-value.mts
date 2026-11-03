import { isObservable, type InitializedObservable } from 'synstate';
import type { Bindable } from '../constant/index.mjs';
import { subscribeInScope } from '../scope/index.mjs';
import { isView } from './is-view.mjs';

/**
 * Writes the value of a {@link Bindable} with `write`, and again on every
 * update (SPEC.md 7.1).
 *
 * - A constant is written once.
 * - A completed observable has its current value written once.
 * - Any other observable is subscribed to, and the subscription is released
 *   when the current scope is disposed.
 *
 * A view is the same as its source, with its function applied before `write`.
 */
export const bindValue = <T,>(
  bindable: Bindable<T>,
  write: (value: T) => void,
): void => {
  if (isView(bindable)) {
    bindable.open((source, fn) => {
      bindObservable(source, (value) => {
        write(fn(value));
      });
    });

    return;
  }

  if (isObservable(bindable)) {
    bindObservable(bindable, write);

    return;
  }

  write(bindable);
};

/**
 * A completed observable is written once and not subscribed to.
 *
 * `subscribe` delivers the current value before it adds the subscriber, so a
 * value written by the first `write` itself (a `For` row or a switch branch
 * mounted then writes what chose it, #3141) reaches no subscriber; it is
 * written once the subscription is in place.
 */
const bindObservable = <A,>(
  source: InitializedObservable<A>,
  write: (value: A) => void,
): void => {
  if (source.isCompleted) {
    write(source.getSnapshot().value);

    return;
  }

  const { updateToken } = source;

  subscribeInScope(source, write);

  if (source.updateToken !== updateToken) {
    write(source.getSnapshot().value);
  }
};
