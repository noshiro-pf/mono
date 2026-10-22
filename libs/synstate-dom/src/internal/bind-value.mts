import {
  isObservable,
  onScopeDispose,
  type InitializedObservable,
} from 'synstate';
import type { Bindable } from '../constant/index.mjs';
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
      subscribeInScope(source, (value) => {
        write(fn(value));
      });
    });

    return;
  }

  if (isObservable(bindable)) {
    subscribeInScope(bindable, write);

    return;
  }

  write(bindable);
};

const subscribeInScope = <A,>(
  source: InitializedObservable<A>,
  write: (value: A) => void,
): void => {
  if (source.isCompleted) {
    write(source.getSnapshot().value);

    return;
  }

  const subscription = source.subscribe(write);

  onScopeDispose(() => {
    subscription.unsubscribe();
  });
};
