import { Optional } from 'ts-data-forge';
import { createAsyncChildObservable } from '../base/index.mjs';
import type {
  AuditOperatorObservable,
  KeepInitialValueOperator,
  Observable,
  TimerId,
} from '../types/index.mjs';

/**
 * Ignores source values for duration milliseconds, then emits the most recent value from the source Observable, then repeats this process.
 *
 * Unlike `throttle` which emits the first value, `audit` emits the last value.
 *
 * Completing it, or its source completing, passes on the value its timer is
 * still holding before the completion; `dispose()` drops that value.
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
  // @sumi-expect-error banned-syntax/no-unsafe-type-assertion
  ((parentObservable) =>
    createAuditObservable(
      parentObservable,
      milliSeconds,
    )) as KeepInitialValueOperator<A, A>;

const createAuditObservable = <A,>(
  parentObservable: Observable<A>,
  milliSeconds: number,
): AuditOperatorObservable<A> =>
  createAsyncChildObservable(
    {
      parents: [parentObservable],
      initialValue: parentObservable.getSnapshot(),
    },
    ({ startUpdate, onComplete }) => {
      /** Set while a window is open; its end passes on the latest value. */
      let mut_timerId: TimerId | undefined = undefined;

      /** Ends the open window, passing on the latest value of the source. */
      const emitLatest = (): void => {
        mut_timerId = undefined;

        const sn = parentObservable.getSnapshot();

        if (Optional.isSome(sn)) {
          startUpdate(sn.value);
        }
      };

      onComplete(() => {
        if (mut_timerId === undefined) {
          return;
        }

        clearTimeout(mut_timerId);

        mut_timerId = undefined;
      });

      return {
        tryUpdate: (updateToken) => {
          if (
            mut_timerId !== undefined ||
            parentObservable.updateToken !== updateToken ||
            Optional.isNone(parentObservable.getSnapshot())
          ) {
            return; // skip update
          }

          // set timer
          mut_timerId = setTimeout(emitLatest, milliSeconds);
        },
        flush: () => {
          if (mut_timerId === undefined) {
            return;
          }

          clearTimeout(mut_timerId);

          emitLatest();
        },
      };
    },
  );
