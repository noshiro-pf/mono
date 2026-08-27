import { Optional } from 'ts-data-forge';
import { createRootObservable } from '../base/index.mjs';
import { type TimerId, type TimerObservable } from '../types/index.mjs';

/**
 * Creates an observable that emits 0 after a specified delay and then completes.
 *
 * @param milliSeconds - The delay in milliseconds before emission
 * @param startManually - If true, waits for manual start (default: false)
 * @returns An observable that emits after delay
 *
 * @example
 * ```ts
 * //  Timeline:
 * //
 * //  Time(ms)  0     ...   1000
 * //  delayed$                X (emits and completes)
 * //
 * //  Explanation:
 * //  - timer emits once after the specified delay, then completes
 * //  - Useful for delayed actions or timeouts
 *
 * const delayed$ = timer(100);
 *
 * const valueHistory: number[] = [];
 *
 * await new Promise<void>((resolve) => {
 *   delayed$.subscribe(
 *     () => {
 *       valueHistory.push(1);
 *     },
 *     () => {
 *       resolve();
 *     },
 *   );
 * });
 *
 * assert.deepStrictEqual(valueHistory, [1]);
 * ```
 */
export const timer = (
  milliSeconds: number,
  options?: Readonly<{
    startManually?: boolean;
  }>,
): TimerObservable => {
  let mut_timerId: TimerId | undefined = undefined;

  let mut_isStarted = false;

  const resetTimer = (): void => {
    if (mut_timerId !== undefined) {
      clearTimeout(mut_timerId);
    }
  };

  const observable = createRootObservable<0, Readonly<{ start: () => void }>>(
    { initialValue: Optional.none, onComplete: resetTimer },
    ({ startUpdate, isCompleted, complete }) => ({
      start: () => {
        if (mut_isStarted) {
          console.warn('cannot start twice');

          return;
        }

        mut_isStarted = true;

        if (isCompleted()) {
          console.warn('cannot restart stopped TimerObservable');

          return;
        }

        mut_timerId = setTimeout(() => {
          startUpdate(0);

          complete();
        }, milliSeconds);
      },
    }),
  );

  if (!(options?.startManually ?? false)) {
    observable.start();
  }

  return observable;
};
