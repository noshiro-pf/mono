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
 * const scroll$ = source<Event>();
 *
 * const throttled$ = scroll$.pipe(throttleTime(1000));
 *
 * throttled$.subscribe((event_) => {
 *   console.log(event_);
 * });
 * // Emits at most once per second
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
