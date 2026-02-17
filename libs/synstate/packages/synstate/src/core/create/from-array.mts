import { Optional } from 'ts-data-forge';
import { RootObservableClass } from '../class/index.mjs';
import { type FromArrayObservable } from '../types/index.mjs';

/**
 * Creates an observable that emits all values from an array sequentially, then completes.
 *
 * @template A - The type of array elements
 * @param values - The array of values to emit
 * @param startManually - If true, waits for manual start (default: false)
 * @returns An observable that emits array values
 *
 * @example
 * ```ts
 * const nums$ = fromArray([1, 2, 3]);
 *
 * nums$.subscribe((x) => {
 *   console.log(x);
 * });
 * // logs: 1, 2, 3
 * ```
 */
export const fromArray = <A,>(
  values: readonly A[],
  startManually: boolean = false,
): FromArrayObservable<A> =>
  new FromArrayObservableClass<A>(values, startManually);

class FromArrayObservableClass<A>
  extends RootObservableClass<A>
  implements FromArrayObservable<A>
{
  readonly #values: readonly A[];

  constructor(values: readonly A[], startManually: boolean = false) {
    super({ initialValue: Optional.none });

    this.#values = values;

    if (!startManually) {
      setTimeout(() => {
        this.emit();
      }, 0);
    }
  }

  emit(): this {
    if (this.isCompleted) return this;

    for (const v of this.#values) {
      this.startUpdate(v);
    }

    this.complete();

    return this;
  }
}
