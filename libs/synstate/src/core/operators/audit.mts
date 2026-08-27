import { Optional } from 'ts-data-forge';
import { createAsyncChildObservable } from '../base/index.mjs';
import {
  type AuditOperatorObservable,
  type KeepInitialValueOperator,
  type Observable,
  type TimerId,
} from '../types/index.mjs';

/**
 * Ignores source values for duration milliseconds, then emits the most recent value from the source Observable, then repeats this process.
 *
 * Unlike `throttle` which emits the first value, `audit` emits the last value.
 *
 * @template A - The type of values from the source
 * @param milliSeconds - The audit time window in milliseconds
 * @returns An operator that audits emissions from the observable
 *
 * @example
 * ```ts
 * //  Timeline (250ms audit):
 * //
 * //  Time(x50ms)  0 1 2 3 4 5 6 7 8 9 0 1 2 3 4 5 6 7 8 9 0 1 2 3 4 5 6 7 8 9 0
 * //
 * //  input$       0       2   3                   9   10  11  12  13  14
 * //               |- 250ms -> |- 250ms ->         |- 250ms -> |- 250ms ->
 * //  audited$               2           3                   11          14   (emitted at end of window)
 * //
 * //  Explanation:
 * //  - audit emits the LAST value received during each time window
 * //  - Unlike throttle (which emits the FIRST value), audit emits the LAST
 * //  - Useful when you want the most recent value after a burst of events
 *
 * const input$ = source<number>();
 *
 * const audited$ = input$.pipe(audit(250));
 *
 * const valueHistory: number[] = [];
 *
 * audited$.subscribe((value) => {
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
 * await sleep(200);
 *
 * input$.next(2);
 *
 * assert.deepStrictEqual(valueHistory, []);
 *
 * await sleep(100);
 *
 * assert.deepStrictEqual(valueHistory, [2]);
 *
 * input$.next(3);
 *
 * await sleep(300);
 *
 * assert.deepStrictEqual(valueHistory, [2, 3]);
 *
 * await sleep(300);
 *
 * input$.next(9);
 *
 * await sleep(100);
 *
 * input$.next(10);
 *
 * await sleep(100);
 *
 * input$.next(11);
 *
 * assert.deepStrictEqual(valueHistory, [2, 3]);
 *
 * await sleep(100);
 *
 * assert.deepStrictEqual(valueHistory, [2, 3, 11]);
 *
 * input$.next(12);
 *
 * await sleep(100);
 *
 * input$.next(13);
 *
 * assert.deepStrictEqual(valueHistory, [2, 3, 11]);
 *
 * await sleep(100);
 *
 * input$.next(14);
 *
 * assert.deepStrictEqual(valueHistory, [2, 3, 11]);
 *
 * await sleep(100);
 *
 * assert.deepStrictEqual(valueHistory, [2, 3, 11, 14]);
 * ```
 */
export const audit = <A,>(
  milliSeconds: number,
): KeepInitialValueOperator<A, A> =>
  // eslint-disable-next-line total-functions/no-unsafe-type-assertion
  ((parentObservable) =>
    createAuditObservable(
      parentObservable,
      milliSeconds,
    )) as KeepInitialValueOperator<A, A>;

const createAuditObservable = <A,>(
  parentObservable: Observable<A>,
  milliSeconds: number,
): AuditOperatorObservable<A> => {
  let mut_timerId: TimerId | undefined = undefined;

  let mut_isSkipping = false;

  const resetTimer = (): void => {
    if (mut_timerId !== undefined) {
      clearTimeout(mut_timerId);
    }
  };

  return createAsyncChildObservable(
    {
      parents: [parentObservable],
      initialValue: parentObservable.getSnapshot(),
      onComplete: resetTimer,
    },
    ({ startUpdate }) =>
      (updateToken) => {
        const par = parentObservable;

        if (
          mut_isSkipping ||
          par.updateToken !== updateToken ||
          Optional.isNone(par.getSnapshot())
        ) {
          return; // skip update
        }

        // set timer
        mut_isSkipping = true;

        mut_timerId = setTimeout(() => {
          const sn = par.getSnapshot();

          if (Optional.isNone(sn)) return;

          startUpdate(sn.value);

          mut_isSkipping = false;
        }, milliSeconds);
      },
  );
};
