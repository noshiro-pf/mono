import { Optional } from 'ts-data-forge';
import { RootObservableClass } from '../class/index.mjs';
import { type OfObservable } from '../types/index.mjs';

/**
 * Creates an observable that emits a single value and then completes.
 *
 * @template A - The type of the value
 * @param value - The value to emit
 * @param startManually - If true, waits for manual start (default: false)
 * @returns An observable that emits the value
 *
 * @example
 * ```ts
 * //  Timeline:
 * //
 * //  num$    42  | (completes immediately)
 * //
 * //  Explanation:
 * //  - of creates an observable that emits a single value, then completes
 * //  - Useful for converting a static value into an observable
 *
 * const num$ = of(42);
 *
 * const mut_history: number[] = [];
 *
 * await new Promise<void>((resolve) => {
 *   num$.subscribe(
 *     (x) => {
 *       mut_history.push(x);
 *     },
 *     () => {
 *       resolve();
 *     },
 *   );
 * });
 *
 * assert.deepStrictEqual(mut_history, [42]);
 * ```
 */
export const of = <A,>(
  value: A,
  startManually: boolean = false,
): OfObservable<A> => new OfObservableClass<A>(value, startManually);

class OfObservableClass<A>
  extends RootObservableClass<A>
  implements OfObservable<A>
{
  readonly #value: A;

  constructor(value: A, startManually: boolean = false) {
    super({ initialValue: Optional.none });

    this.#value = value;

    if (!startManually) {
      setTimeout(() => {
        this.emit();
      }, 0);
    }
  }

  emit(): this {
    if (this.isCompleted) return this;

    this.startUpdate(this.#value);

    this.complete();

    return this;
  }
}
