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
 * const num$ = of(42);
 *
 * num$.subscribe((x) => {
 *   console.log(x);
 * }); // logs: 42
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
