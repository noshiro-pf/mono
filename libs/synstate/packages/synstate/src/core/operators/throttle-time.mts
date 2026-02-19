import { Optional } from 'ts-data-forge';
import { SyncChildObservableClass } from '../class/index.mjs';
import {
  type KeepInitialValueOperator,
  type Observable,
  type ThrottleTimeOperatorObservable,
  type UpdaterSymbol,
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
 * //  Timeline (1000ms throttle):
 * //
 * //  Time(ms)  0    100   200   300   ...   1000  1100  1200  ...   2000  2100
 * //  scroll$   e1   e2    e3    e4          e5    e6    e7          e8    e9
 * //  throttled$ e1                          e5                      e8
 * //             |-------1000ms------>       |------1000ms------>    |------1000ms------>
 * //
 * //  Explanation:
 * //  - throttleTime emits the first value immediately, then ignores subsequent values
 * //    for the specified duration (1000ms)
 * //  - At 0ms: e1 is emitted immediately
 * //  - At 100-300ms: e2, e3, e4 are ignored (within 1000ms window)
 * //  - At 1000ms: e5 is emitted (1000ms has passed since e1)
 * //  - At 1100-1200ms: e6, e7 are ignored
 * //  - At 2000ms: e8 is emitted (1000ms has passed since e5)
 *
 * const scroll$ = source<number>();
 *
 * const throttled$ = scroll$.pipe(throttleTime(200));
 *
 * const mut_history: number[] = [];
 *
 * throttled$.subscribe((value) => {
 *   mut_history.push(value);
 * });
 *
 * scroll$.next(1);
 *
 * assert.deepStrictEqual(mut_history, [1]);
 *
 * await new Promise((resolve) => {
 *   setTimeout(resolve, 50);
 * });
 *
 * scroll$.next(2);
 *
 * scroll$.next(3);
 *
 * assert.deepStrictEqual(mut_history, [1]);
 *
 * await new Promise((resolve) => {
 *   setTimeout(resolve, 200);
 * });
 *
 * scroll$.next(4);
 *
 * assert.deepStrictEqual(mut_history, [1, 4]);
 * ```
 */
export const throttleTime = <A,>(
  milliSeconds: number,
): KeepInitialValueOperator<A, A> =>
  // eslint-disable-next-line total-functions/no-unsafe-type-assertion
  ((parentObservable) =>
    new ThrottleTimeObservableClass(
      parentObservable,
      milliSeconds,
    )) as KeepInitialValueOperator<A, A>;

class ThrottleTimeObservableClass<A>
  extends SyncChildObservableClass<A, readonly [A]>
  implements ThrottleTimeOperatorObservable<A>
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

  override tryUpdate(updaterSymbol: UpdaterSymbol): void {
    const par = this.parents[0];

    const sn = par.getSnapshot();

    if (
      par.updaterSymbol !== updaterSymbol ||
      Optional.isNone(sn) ||
      this.#mut_isSkipping
    ) {
      return; // skip update
    }

    this.setNext(sn.value, updaterSymbol);

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
