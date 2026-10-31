// Sumi bans classes, `this`, method syntax and writes to `this` outside a
// `mut_` binding; an observable is a class (`ObservableBaseClass` says why), so
// those rules are waived here (D-63).
// @sumi-expect-error-file classes/no-class
// @sumi-expect-error-file banned-syntax/no-this
// @sumi-expect-error-file functions/prefer-arrow-function
// @sumi-expect-error-file mutation/no-mutation-without-mut-prefix
import { Optional } from 'ts-data-forge';
import { AsyncChildObservableClass } from '../class/index.mjs';
import type {
  AuditOperatorObservable,
  KeepInitialValueOperator,
  Observable,
  TimerId,
  UpdateToken,
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
    new AuditObservableClass(
      parentObservable,
      milliSeconds,
    )) as KeepInitialValueOperator<A, A>;

class AuditObservableClass<A>
  extends AsyncChildObservableClass<A, readonly [A]>
  implements AuditOperatorObservable<A>
{
  readonly #milliSeconds: number;

  /** Set while a window is open; its end passes on the latest value. */
  #mut_timerId: TimerId | undefined;

  constructor(parentObservable: Observable<A>, milliSeconds: number) {
    super({
      parents: [parentObservable],
      initialValue: parentObservable.getSnapshot(),
    });

    this.#mut_timerId = undefined;

    this.#milliSeconds = milliSeconds;

    this.attach();
  }

  /** Ends the open window, passing on the latest value of the source. */
  #emitLatest(): void {
    this.#mut_timerId = undefined;

    const sn = this.parents[0].getSnapshot();

    if (Optional.isSome(sn)) {
      this.startUpdate(sn.value);
    }
  }

  override tryUpdate(updateToken: UpdateToken): void {
    const par = this.parents[0];

    if (
      this.#mut_timerId !== undefined ||
      par.updateToken !== updateToken ||
      Optional.isNone(par.getSnapshot())
    ) {
      return; // skip update
    }

    // set timer
    this.#mut_timerId = setTimeout(() => {
      this.#emitLatest();
    }, this.#milliSeconds);
  }

  protected override flush(): void {
    if (this.#mut_timerId === undefined) {
      return;
    }

    clearTimeout(this.#mut_timerId);

    this.#emitLatest();
  }

  protected override teardown(): void {
    if (this.#mut_timerId === undefined) {
      return;
    }

    clearTimeout(this.#mut_timerId);

    this.#mut_timerId = undefined;
  }
}
