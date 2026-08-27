import { asSafeUint, Optional, SafeUint } from 'ts-data-forge';
import { createRootObservable } from '../base/index.mjs';
import { type CounterObservable, type TimerId } from '../types/index.mjs';

/**
 * Creates an observable that emits incremental numbers at a specified interval.
 * Starts with 0 immediately after subscription, then emits 1, 2, 3, ... every interval.
 *
 * @param intervalMilliSeconds - The interval duration in milliseconds
 * @param startManually - If true, waits for manual start (default: false)
 * @returns An observable that emits sequential numbers
 *
 * @example
 * ```ts
 * //  Timeline:
 * //
 * //  Time(s)   0     1     2     3     4     5
 * //  tick$     0     1     2     3     4     5     ...
 * //
 * //  Explanation:
 * //  - counter emits incrementing numbers at specified intervals
 * //  - Starts at 0 and continues indefinitely
 * //  - Useful for periodic tasks or animations
 *
 * const tick$ = counter(100);
 *
 * const valueHistory: number[] = [];
 *
 * const subscription = tick$.subscribe((count) => {
 *   valueHistory.push(count);
 * });
 *
 * await new Promise((resolve) => {
 *   setTimeout(resolve, 350);
 * });
 *
 * subscription.unsubscribe();
 *
 * assert.isTrue(Arr.isMinLengthArray(3, valueHistory));
 *
 * assert.deepStrictEqual(valueHistory[0], 0);
 *
 * assert.deepStrictEqual(valueHistory[1], 1);
 *
 * assert.deepStrictEqual(valueHistory[2], 2);
 * ```
 */
export const counter = (
  intervalMilliSeconds: number,
  options?: Readonly<{
    startManually?: boolean;
  }>,
): CounterObservable => {
  let mut_counter: SafeUint = asSafeUint(0);

  let mut_timerId0: TimerId | undefined = undefined;

  let mut_timerId: TimerId | undefined = undefined;

  let mut_isStarted = false;

  const resetTimer = (): void => {
    if (mut_timerId0 === undefined || mut_timerId === undefined) {
      return;
    }

    clearInterval(mut_timerId0);

    clearInterval(mut_timerId);
  };

  const observable = createRootObservable<
    SafeUint,
    Readonly<{ start: () => void }>
  >(
    { initialValue: Optional.none, onComplete: resetTimer },
    ({ startUpdate, isCompleted }) => ({
      start: () => {
        if (mut_isStarted) {
          console.warn('cannot start twice');

          return;
        }

        mut_isStarted = true;

        if (isCompleted()) {
          console.warn('cannot restart stopped CounterObservable');

          return;
        }

        mut_timerId0 = setTimeout(() => {
          startUpdate(mut_counter);
        }, 0);

        mut_timerId = setInterval(() => {
          mut_counter = SafeUint.add(1, mut_counter);

          startUpdate(mut_counter);
        }, intervalMilliSeconds);
      },
    }),
  );

  if (!(options?.startManually ?? false)) {
    observable.start();
  }

  return observable;
};
