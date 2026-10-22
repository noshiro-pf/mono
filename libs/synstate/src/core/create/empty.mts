import { Optional } from 'ts-data-forge';
import { RootObservableClass } from '../class/index.mjs';
import type { RootObservable } from '../types/index.mjs';

/**
 * Creates an Observable that holds no value and is already completed, so it
 * never passes anything on (almost equivalent to RxJS `EMPTY`). Useful inside
 * `switchMap` for the branch that should follow nothing, where a `source()`
 * would offer a `next` that nothing calls.
 *
 * @template A - The type of the values it would carry
 * @returns An Observable with no value that is already completed
 *
 * @example
 * ```ts
 * const nothing$ = empty<number>();
 *
 * const valueHistory: number[] = [];
 *
 * nothing$.subscribe(
 *   (value) => {
 *     valueHistory.push(value);
 *   },
 *   () => {
 *     // onComplete — called immediately since empty() completes right away
 *   },
 * );
 *
 * assert.deepStrictEqual(valueHistory, []);
 *
 * assert.strictEqual(nothing$.isCompleted, true);
 * ```
 */
export const empty = <A,>(): RootObservable<A> => {
  const obs = new RootObservableClass<A>({
    initialValue: Optional.none,
  });

  obs.complete();

  return obs;
};
