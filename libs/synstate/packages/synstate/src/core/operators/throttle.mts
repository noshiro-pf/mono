import { Optional } from 'ts-data-forge';
import { SyncChildObservableClass } from '../class/index.mjs';
import {
  type KeepInitialValueOperator,
  type Observable,
  type ThrottleOperatorObservable,
  type TimerId,
  type UpdateToken,
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
    new ThrottleObservableClass(
      parentObservable,
      milliSeconds,
    )) as KeepInitialValueOperator<A, A>;

class ThrottleObservableClass<A>
  extends SyncChildObservableClass<A, readonly [A]>
  implements ThrottleOperatorObservable<A>
{
  readonly #milliSeconds: number;
  #mut_timerId: TimerId | undefined;
  #mut_isSkipping: boolean;

  constructor(parentObservable: Observable<A>, milliSeconds: number) {
    super({
      parents: [parentObservable],
      initialValue: parentObservable.getSnapshot(),
    });

    this.#mut_timerId = undefined;

    this.#mut_isSkipping = false;

    this.#milliSeconds = milliSeconds;
  }

  override tryUpdate(updateToken: UpdateToken): void {
    const par = this.parents[0];

    const sn = par.getSnapshot();

    if (
      par.updateToken !== updateToken ||
      Optional.isNone(sn) ||
      this.#mut_isSkipping
    ) {
      return; // skip update
    }

    this.setNext(sn.value, updateToken);

    this.#mut_isSkipping = true;

    // set timer
    this.#mut_timerId = setTimeout(() => {
      this.#mut_isSkipping = false;
    }, this.#milliSeconds);
  }

  #resetTimer(): void {
    if (this.#mut_timerId !== undefined) {
      clearTimeout(this.#mut_timerId);
    }
  }

  override complete(): void {
    this.#resetTimer();

    super.complete();
  }
}
