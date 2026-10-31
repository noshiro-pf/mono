// Sumi bans classes, `this`, method syntax and writes to `this` outside a
// `mut_` binding; an observable is a class (`ObservableBaseClass` says why), so
// those rules are waived here (D-63).
// @sumi-expect-error-file classes/no-class
// @sumi-expect-error-file banned-syntax/no-this
// @sumi-expect-error-file functions/prefer-arrow-function
// @sumi-expect-error-file mutation/no-mutation-without-mut-prefix
import { asSafeUint, Optional, SafeUint } from 'ts-data-forge';
import type { PositiveSafeIntWithSmallInt } from 'ts-type-forge';
import { RootObservableClass } from '../class/index.mjs';
import type { CounterObservable, TimerId } from '../types/index.mjs';

/**
 * Creates an observable that emits incremental numbers at a specified interval.
 * Emits 0 in the macrotask right after `start()` (which runs at creation unless
 * `startManually` is set), then 1, 2, 3, ... every interval. A subscriber added
 * after that 0 has been emitted does not receive it.
 *
 * @param intervalMilliSeconds - The interval duration in milliseconds
 * @param options - Optional settings
 * @param options.startManually - If true, waits for `start()` instead of
 *   starting at creation (default: false)
 * @param options.emitInitial - If false, skips the 0 emitted right after
 *   `start()`, so the first value is 1, one interval later — like RxJS
 *   `interval` rather than `timer(0, ms)` (default: true)
 * @param options.times - If set, completes right after the `times`-th
 *   emission and clears its timers. Completion does not travel upstream, so
 *   `counter(ms).pipe(take(n))` leaves the counter running; pass `times` to
 *   the counter instead (default: unlimited)
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
 * assert.strictEqual(valueHistory[0], 0);
 *
 * assert.strictEqual(valueHistory[1], 1);
 *
 * assert.strictEqual(valueHistory[2], 2);
 * ```
 */
export const counter = (
  intervalMilliSeconds: number,
  options?: Readonly<{
    startManually?: boolean;
    emitInitial?: boolean;
    times?: PositiveSafeIntWithSmallInt;
  }>,
): CounterObservable => {
  const observable = new CounterObservableClass(
    intervalMilliSeconds,
    options?.emitInitial ?? true,
    options?.times,
  );

  if (!(options?.startManually ?? false)) {
    observable.start();
  }

  return observable;
};

class CounterObservableClass
  extends RootObservableClass<SafeUint>
  implements CounterObservable
{
  readonly #intervalMilliSeconds: number;
  readonly #emitInitial: boolean;
  readonly #times: PositiveSafeIntWithSmallInt | undefined;
  #mut_counter: SafeUint;
  #mut_emittedCount: number;
  #mut_timerId0: TimerId | undefined;
  #mut_timerId: TimerId | undefined;
  #mut_isStarted: boolean;

  constructor(
    intervalMilliSeconds: number,
    emitInitial: boolean,
    times: PositiveSafeIntWithSmallInt | undefined,
  ) {
    super({ initialValue: Optional.none });

    this.#intervalMilliSeconds = intervalMilliSeconds;

    this.#emitInitial = emitInitial;

    this.#times = times;

    this.#mut_counter = asSafeUint(0);

    this.#mut_emittedCount = 0;

    this.#mut_timerId0 = undefined;

    this.#mut_timerId = undefined;

    this.#mut_isStarted = false;
  }

  #emit(value: SafeUint): void {
    this.startUpdate(value);

    this.#mut_emittedCount += 1;

    if (this.#times !== undefined && this.#mut_emittedCount >= this.#times) {
      this.complete();
    }
  }

  start(): void {
    if (this.#mut_isStarted) {
      console.warn('cannot start twice');

      return;
    }

    this.#mut_isStarted = true;

    if (this.isCompleted) {
      console.warn('cannot restart stopped CounterObservable');

      return;
    }

    if (this.#emitInitial) {
      this.#mut_timerId0 = setTimeout(() => {
        this.#emit(this.#mut_counter);
      }, 0);
    }

    this.#mut_timerId = setInterval(() => {
      this.#mut_counter = SafeUint.add(1, this.#mut_counter);

      this.#emit(this.#mut_counter);
    }, this.#intervalMilliSeconds);
  }

  protected override teardown(): void {
    if (this.#mut_timerId0 !== undefined) {
      clearTimeout(this.#mut_timerId0);
    }

    if (this.#mut_timerId !== undefined) {
      clearInterval(this.#mut_timerId);
    }
  }
}
