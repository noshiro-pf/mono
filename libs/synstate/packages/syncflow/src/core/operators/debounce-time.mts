import { Optional } from 'ts-data-forge';
import { AsyncChildObservableClass } from '../class/index.mjs';
import {
  type DebounceTimeOperatorObservable,
  type KeepInitialValueOperator,
  type Observable,
  type UpdaterSymbol,
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
 * const input$ = source<string>();
 *
 * const debounced$ = input$.pipe(debounceTime(300));
 *
 * debounced$.subscribe((value) => {
 *   console.log(value);
 * });
 *
 * input$.next('h');
 *
 * input$.next('he');
 *
 * input$.next('hel');
 *
 * input$.next('hello');
 * // After 300ms of silence, logs: hello
 * ```
 */
export const debounceTime = <A,>(
  milliSeconds: number,
): KeepInitialValueOperator<A, A> =>
  // eslint-disable-next-line total-functions/no-unsafe-type-assertion
  ((parentObservable) =>
    new DebounceTimeObservableClass(
      parentObservable,
      milliSeconds,
    )) as KeepInitialValueOperator<A, A>;

class DebounceTimeObservableClass<A>
  extends AsyncChildObservableClass<A, readonly [A]>
  implements DebounceTimeOperatorObservable<A>
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

  override tryUpdate(updaterSymbol: UpdaterSymbol): void {
    const par = this.parents[0];

    const sn = par.getSnapshot();

    if (par.updaterSymbol !== updaterSymbol || Optional.isNone(sn)) {
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
