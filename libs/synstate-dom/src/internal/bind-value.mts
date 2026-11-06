import { isObservable, type InitializedObservable } from 'synstate';
import type { ElementBindable } from '../constant/index.mjs';
import { subscribeInScope } from '../scope/index.mjs';
import { isInlineMap } from './is-inline-map.mjs';

/**
 * Writes the value of an {@link ElementBindable} with `write`, and again on every
 * update (SPEC.md 7.1).
 *
 * - A constant is written once.
 * - A completed observable has its current value written once.
 * - Any other observable is subscribed to, and the subscription is released
 *   when the current scope is disposed.
 *
 * An inline map is the same as its source, with its function applied before `write`,
 * and a result `Object.is` the one this binding last wrote is not written
 * again, as `map` passes on no such result.
 */
export const bindValue = <T,>(
  bindable: ElementBindable<T>,
  write: (value: T) => void,
): void => {
  if (isInlineMap(bindable)) {
    bindable.open((source, fn) => {
      const mut_last: { written: boolean; value: T | undefined } = {
        written: false,
        value: undefined,
      };

      bindObservable(source, (value) => {
        const next = fn(value);

        if (mut_last.written && Object.is(mut_last.value, next)) {
          return;
        }

        mut_last.written = true;

        mut_last.value = next;

        write(next);
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
 * A value written by the first `write` itself (a `For` row or a switch branch
 * mounted then writes what chose it, #3141) is written again by
 * `subscribeInScope` once the subscription is in place.
 */
const bindObservable = <A,>(
  source: InitializedObservable<A>,
  write: (value: A) => void,
): void => {
  if (source.isCompleted) {
    write(source.getSnapshot().value);

    return;
  }

  subscribeInScope(source, write);
};
