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
 * //  Timeline (300ms debounce):
 * //
 * //  Time(ms)  0     100    200    300    400    500    600   ...   900   1000
 * //  input$    'h'   'he'   'hel'  'hello'
 * //  debounced$                                         'hello' (emitted after 300ms silence)
 * //
 * //  Explanation:
 * //  - At 0ms: 'h' is emitted, timer starts
 * //  - At 100ms: 'he' is emitted, timer resets
 * //  - At 200ms: 'hel' is emitted, timer resets
 * //  - At 300ms: 'hello' is emitted, timer resets
 * //  - At 600ms: No new emission for 300ms, 'hello' is finally emitted
 *
 * const input$ = source<string>();
 *
 * const debounced$ = input$.pipe(debounceTime(300));
 *
 * const mut_history: string[] = [];
 *
 * debounced$.subscribe((value) => {
 *   mut_history.push(value);
 * });
 *
 * input$.next('h');
 *
 * input$.next('he');
 *
 * input$.next('hel');
 *
 * input$.next('hello');
 *
 * await new Promise((resolve) => {
 *   setTimeout(resolve, 400);
 * });
 *
 * assert.deepStrictEqual(mut_history, ['hello']);
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
