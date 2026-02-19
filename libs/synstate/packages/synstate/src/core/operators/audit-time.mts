import { Optional } from 'ts-data-forge';
import { AsyncChildObservableClass } from '../class/index.mjs';
import {
  type AuditTimeOperatorObservable,
  type KeepInitialValueOperator,
  type Observable,
  type UpdaterSymbol,
} from '../types/index.mjs';

/**
 * Emits the last value from the source observable after a specified time window has passed.
 * Unlike throttleTime which emits the first value, auditTime emits the last value.
 *
 * @template A - The type of values from the source
 * @param milliSeconds - The audit time window in milliseconds
 * @returns An operator that audits emissions from the observable
 *
 * @example
 * ```ts
 * //  Timeline (1000ms audit):
 * //
 * //  Time(ms)  0    100   200   300   400   ...   1000  1100
 * //  input$    e1   e2    e3    e4    e5
 * //  audited$                                      e5 (emitted at end of window)
 * //            |-------1000ms window------>        ^
 * //
 * //  Explanation:
 * //  - auditTime emits the LAST value received during each time window
 * //  - Unlike throttleTime (which emits the FIRST value), audit emits the LAST
 * //  - At 0-1000ms: e1-e5 are received
 * //  - At 1000ms: e5 (the last value in the window) is emitted
 * //  - Useful when you want the most recent value after a burst of events
 *
 * const input$ = source<number>();
 *
 * const audited$ = input$.pipe(auditTime(200));
 *
 * const mut_history: number[] = [];
 *
 * audited$.subscribe((value) => {
 *   mut_history.push(value);
 * });
 *
 * input$.next(1);
 *
 * input$.next(2);
 *
 * input$.next(3);
 *
 * assert.deepStrictEqual(mut_history, []);
 *
 * await new Promise((resolve) => {
 *   setTimeout(resolve, 250);
 * });
 *
 * assert.deepStrictEqual(mut_history, [3]);
 *
 * input$.next(4);
 *
 * input$.next(5);
 *
 * await new Promise((resolve) => {
 *   setTimeout(resolve, 250);
 * });
 *
 * assert.deepStrictEqual(mut_history, [3, 5]);
 * ```
 */
export const auditTime = <A,>(
  milliSeconds: number,
): KeepInitialValueOperator<A, A> =>
  // eslint-disable-next-line total-functions/no-unsafe-type-assertion
  ((parentObservable) =>
    new AuditTimeObservableClass(
      parentObservable,
      milliSeconds,
    )) as KeepInitialValueOperator<A, A>;

class AuditTimeObservableClass<A>
  extends AsyncChildObservableClass<A, readonly [A]>
  implements AuditTimeOperatorObservable<A>
{
  readonly #milliSeconds: number;
  #mut_timerId: TimerId | undefined;
  #mut_isSkipping: boolean;

  constructor(parentObservable: Observable<A>, milliSeconds: number) {
    super({
      parents: [parentObservable],
      initialValue: parentObservable.getSnapshot(),
    });

    this.#mut_isSkipping = false;

    this.#mut_timerId = undefined;

    this.#milliSeconds = milliSeconds;
  }

  override tryUpdate(updaterSymbol: UpdaterSymbol): void {
    const par = this.parents[0];

    if (
      par.updaterSymbol !== updaterSymbol ||
      Optional.isNone(par.getSnapshot()) ||
      this.#mut_isSkipping
    ) {
      return; // skip update
    }

    // set timer
    this.#mut_isSkipping = true;

    this.#mut_timerId = setTimeout(() => {
      const sn = par.getSnapshot();

      if (Optional.isNone(sn)) return;

      this.startUpdate(sn.value);

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
