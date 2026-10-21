import { Optional } from 'ts-data-forge';
import { RootObservableClass } from '../class/index.mjs';
import { type InitializedRootObservable } from '../types/index.mjs';

/**
 * Creates an Observable that holds a single static value and immediately
 * completes. Useful inside `switchMap` to emit a fallback value when no
 * asynchronous work is needed.
 *
 * @template A - The type of the value
 * @param value - The value to emit
 * @returns An initialized Observable that holds the value and is already completed
 *
 * @example
 * ```ts
 * const greeting$ = just('hello');
 *
 * const valueHistory: string[] = [];
 *
 * greeting$.subscribe(
 *   (value) => {
 *     valueHistory.push(value);
 *   },
 *   () => {
 *     // onComplete — called immediately since just() completes right away
 *   },
 * );
 *
 * assert.deepStrictEqual(valueHistory, ['hello']);
 *
 * assert.strictEqual(greeting$.isCompleted, true);
 * ```
 */
export const just = <const A,>(value: A): InitializedRootObservable<A> => {
  const obs = new RootObservableClass<A>({
    initialValue: Optional.some(value),
  });

  obs.complete();

  // eslint-disable-next-line total-functions/no-unsafe-type-assertion
  return obs as InitializedRootObservable<A>;
};
