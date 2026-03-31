import { asSafeUint, Optional, SafeUint } from 'ts-data-forge';
import { RootObservableClass } from '../class/index.mjs';
import { type CounterObservable, type TimerId } from '../types/index.mjs';

/**
 * Creates an observable that emits incremental numbers at a specified interval.
 * Starts with 0 immediately after subscription, then emits 1, 2, 3, ... every interval.
 *
 * @param intervalMilliSeconds - The interval duration in milliseconds
 * @param startManually - If true, waits for manual start (default: false)
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
 * assert.isTrue(Arr.isArrayAtLeastLength(valueHistory, 3));
 *
 * assert.deepStrictEqual(valueHistory[0], 0);
 *
 * assert.deepStrictEqual(valueHistory[1], 1);
 *
 * assert.deepStrictEqual(valueHistory[2], 2);
 * ```
 */
export const counter = (
  intervalMilliSeconds: number,
  options?: Readonly<{
    startManually?: boolean;
  }>,
): CounterObservable =>
  new CounterObservableClass(
    intervalMilliSeconds,
    options?.startManually ?? false,
  );

class CounterObservableClass
  extends RootObservableClass<SafeUint>
  implements CounterObservable
{
  readonly #intervalMilliSeconds: number;
  #mut_counter: SafeUint;
  #mut_timerId0: TimerId | undefined;
  #mut_timerId: TimerId | undefined;
  #mut_isStarted: boolean;

  constructor(intervalMilliSeconds: number, startManually: boolean) {
    super({ initialValue: Optional.none });

    this.#intervalMilliSeconds = intervalMilliSeconds;

    this.#mut_counter = asSafeUint(0);

    this.#mut_timerId0 = undefined;

    this.#mut_timerId = undefined;

    this.#mut_isStarted = false;

    if (!startManually) {
      this.start();
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

    this.#mut_timerId0 = setTimeout(() => {
      this.startUpdate(this.#mut_counter);
    }, 0);

    this.#mut_timerId = setInterval(() => {
      this.#mut_counter = SafeUint.add(1, this.#mut_counter);

      this.startUpdate(this.#mut_counter);
    }, this.#intervalMilliSeconds);
  }

  #resetTimer(): void {
    if (this.#mut_timerId0 !== undefined && this.#mut_timerId !== undefined) {
      clearInterval(this.#mut_timerId0);

      clearInterval(this.#mut_timerId);
    }
  }

  override complete(): void {
    this.#resetTimer();

    super.complete();
  }
}
