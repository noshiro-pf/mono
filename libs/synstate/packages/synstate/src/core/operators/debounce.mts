import { Optional } from 'ts-data-forge';
import { AsyncChildObservableClass } from '../class/index.mjs';
import {
  type DebounceOperatorObservable,
  type KeepInitialValueOperator,
  type Observable,
  type TimerId,
  type UpdateToken,
} from '../types/index.mjs';

/**
 * Delays emissions from the source observable until a specified time has passed without another emission.
 * Useful for handling user input events like typing or scrolling.
 *
 * @template A - The type of values from the source
 * @param milliSeconds - The debounce duration in milliseconds
 * @returns An operator that debounces the observable
 *
 * @example
 * ```ts
 * //  Timeline (250ms debounce):
 * //
 * //  Time(x50ms)  0 1 2 3 4 5 6 7 8 9 0 1 2 3 4 5 6 7 8 9 0 1 2 3 4 5 6 7 8 9 0
 * //
 * //  input$       0       2   3                   9   10  11  12  13  14
 * //                               |- 250ms ->                         |- 250ms ->
 * //  debounced$                   3                                             14   (emitted after 250ms silence)
 * //
 * //  Explanation:
 * //  - debounce emits the latest value AFTER a quiet period with no new emissions
 * //  - Unlike audit (which uses a fixed window), debounce resets the timer on every emission
 * //  - Useful for search-as-you-type and form validation
 *
 * const input$ = source<number>();
 *
 * const debounced$ = input$.pipe(debounce(250));
 *
 * const valueHistory: number[] = [];
 *
 * debounced$.subscribe((value) => {
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
 * await sleep(100);
 *
 * input$.next(3);
 *
 * assert.deepStrictEqual(valueHistory, []);
 *
 * await sleep(300);
 *
 * assert.deepStrictEqual(valueHistory, [3]);
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
 * await sleep(100);
 *
 * input$.next(12);
 *
 * await sleep(100);
 *
 * input$.next(13);
 *
 * await sleep(100);
 *
 * input$.next(14);
 *
 * assert.deepStrictEqual(valueHistory, [3]);
 *
 * await sleep(300);
 *
 * assert.deepStrictEqual(valueHistory, [3, 14]);
 * ```
 */
export const debounce = <A,>(
  milliSeconds: number,
): KeepInitialValueOperator<A, A> =>
  // eslint-disable-next-line total-functions/no-unsafe-type-assertion
  ((parentObservable) =>
    new DebounceObservableClass(
      parentObservable,
      milliSeconds,
    )) as KeepInitialValueOperator<A, A>;

class DebounceObservableClass<A>
  extends AsyncChildObservableClass<A, readonly [A]>
  implements DebounceOperatorObservable<A>
{
  readonly #milliSeconds: number;
  #mut_timerId: TimerId | undefined;

  constructor(parentObservable: Observable<A>, milliSeconds: number) {
    super({
      parents: [parentObservable],
      initialValue: parentObservable.getSnapshot(),
    });

    this.#mut_timerId = undefined;

    this.#milliSeconds = milliSeconds;
  }

  override tryUpdate(updateToken: UpdateToken): void {
    const par = this.parents[0];

    const sn = par.getSnapshot();

    if (par.updateToken !== updateToken || Optional.isNone(sn)) {
      return; // skip update
    }

    this.#resetTimer();

    // set timer
    this.#mut_timerId = setTimeout(() => {
      if (Optional.isNone(sn)) return;

      this.startUpdate(sn.value);
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
