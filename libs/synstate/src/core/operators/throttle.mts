import { Optional } from 'ts-data-forge';
import { createSyncChildObservable } from '../base/index.mjs';
import {
  type KeepInitialValueOperator,
  type Observable,
  type ThrottleOperatorObservable,
  type TimerId,
} from '../types/index.mjs';

/**
 * Emits the first value, then ignores subsequent values for a specified duration.
 * After the duration, the next emission is allowed through.
 *
 * @template A - The type of values from the source
 * @param milliSeconds - The throttle duration in milliseconds
 * @returns An operator that throttles emissions
 *
 * @example
 * ```ts
 * //  Timeline (250ms throttle):
 * //
 * //  Time(x50ms)  0 1 2 3 4 5 6 7 8 9 0 1 2 3 4 5 6 7 8 9 0 1 2 3 4 5 6 7 8 9 0
 * //
 * //  input$       0       2   3                   9   10  11  12  13  14
 * //               |- 250ms -> |- 250ms ->         |- 250ms ->    |- 250ms ->
 * //  throttled$   0           3                   9          12           (emitted at start of window)
 * //
 * //  Explanation:
 * //  - throttle emits the FIRST value received, then ignores subsequent values
 * //    for the specified duration (250ms)
 * //  - Unlike audit (which emits the LAST value), throttle emits the FIRST
 * //  - Useful for rate-limiting scroll/resize events
 *
 * const input$ = source<number>();
 *
 * const throttled$ = input$.pipe(throttle(250));
 *
 * const valueHistory: number[] = [];
 *
 * throttled$.subscribe((value) => {
 *   valueHistory.push(value);
 * });
 *
 * const sleep = (ms: number): Promise<void> =>
 *   new Promise((resolve) => {
 *     setTimeout(resolve, ms);
 *   });
 *
 * input$.next(0);
 *
 * assert.deepStrictEqual(valueHistory, [0]);
 *
 * await sleep(200);
 *
 * input$.next(2);
 *
 * assert.deepStrictEqual(valueHistory, [0]);
 *
 * await sleep(100);
 *
 * input$.next(3);
 *
 * assert.deepStrictEqual(valueHistory, [0, 3]);
 *
 * await sleep(300);
 *
 * input$.next(9);
 *
 * assert.deepStrictEqual(valueHistory, [0, 3, 9]);
 *
 * await sleep(100);
 *
 * input$.next(10);
 *
 * await sleep(100);
 *
 * input$.next(11);
 *
 * assert.deepStrictEqual(valueHistory, [0, 3, 9]);
 *
 * await sleep(100);
 *
 * input$.next(12);
 *
 * assert.deepStrictEqual(valueHistory, [0, 3, 9, 12]);
 * ```
 */
export const throttle = <A,>(
  milliSeconds: number,
): KeepInitialValueOperator<A, A> =>
  // eslint-disable-next-line total-functions/no-unsafe-type-assertion
  ((parentObservable) =>
    createThrottleObservable(
      parentObservable,
      milliSeconds,
    )) as KeepInitialValueOperator<A, A>;

const createThrottleObservable = <A,>(
  parentObservable: Observable<A>,
  milliSeconds: number,
): ThrottleOperatorObservable<A> => {
  let mut_timerId: TimerId | undefined = undefined;

  let mut_isSkipping = false;

  const resetTimer = (): void => {
    if (mut_timerId !== undefined) {
      clearTimeout(mut_timerId);
    }
  };

  return createSyncChildObservable(
    {
      parents: [parentObservable],
      initialValue: parentObservable.getSnapshot(),
      onComplete: resetTimer,
    },
    ({ setNext }) =>
      (updateToken) => {
        const sn = parentObservable.getSnapshot();

        if (
          mut_isSkipping ||
          parentObservable.updateToken !== updateToken ||
          Optional.isNone(sn)
        ) {
          return; // skip update
        }

        setNext(sn.value, updateToken);

        mut_isSkipping = true;

        // set timer
        mut_timerId = setTimeout(() => {
          mut_isSkipping = false;
        }, milliSeconds);
      },
  );
};
