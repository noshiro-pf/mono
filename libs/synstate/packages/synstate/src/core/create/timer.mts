import { Optional } from 'ts-data-forge';
import { RootObservableClass } from '../class/index.mjs';
import { type TimerObservable } from '../types/index.mjs';

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
 * const mut_history: number[] = [];
 *
 * await new Promise<void>((resolve) => {
 *   delayed$.subscribe(
 *     () => {
 *       mut_history.push(1);
 *     },
 *     () => {
 *       resolve();
 *     },
 *   );
 * });
 *
 * assert.deepStrictEqual(mut_history, [1]);
 * ```
 */
export const timer = (
  milliSeconds: number,
  startManually: boolean = false,
): TimerObservable => new TimerObservableClass(milliSeconds, startManually);

class TimerObservableClass
  extends RootObservableClass<0>
  implements TimerObservable
{
  readonly #milliSeconds: number;
  #mut_timerId: TimerId | undefined;
  #mut_isStarted: boolean;

  constructor(milliSeconds: number, startManually: boolean) {
    super({ initialValue: Optional.none });

    this.#milliSeconds = milliSeconds;

    this.#mut_timerId = undefined;

    this.#mut_isStarted = false;

    if (!startManually) {
      this.start();
    }
  }

  start(): this {
    if (this.#mut_isStarted) {
      console.warn('cannot start twice');

      return this;
    }

    this.#mut_isStarted = true;

    if (this.isCompleted) {
      console.warn('cannot restart stopped TimerObservable');

      return this;
    }

    this.#mut_timerId = setTimeout(() => {
      this.startUpdate(0);

      this.complete();
    }, this.#milliSeconds);

    return this;
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
