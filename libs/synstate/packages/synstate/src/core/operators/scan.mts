import { Optional } from 'ts-data-forge';
import { InitializedSyncChildObservableClass } from '../class/index.mjs';
import {
  type Observable,
  type ScanOperatorObservable,
  type UpdaterSymbol,
  type WithInitialValueOperator,
} from '../types/index.mjs';

/**
 * Applies an accumulator function over the source observable and emits each intermediate result.
 * Similar to Array.reduce but emits accumulated value after each source emission.
 *
 * @template A - The type of values from the source
 * @template B - The type of the accumulated value
 * @param reducer - The accumulator function
 * @param initialValue - The initial accumulated value (seed)
 * @returns An operator that accumulates values
 *
 * @example
 * ```ts
 * //  Timeline (accumulating sum):
 * //
 * //  num$    1     2     3     4     5
 * //  sum$    1     3     6     10    15
 * //          |     |     |     |     |
 * //          0+1   1+2   3+3   6+4   10+5
 * //
 * //  Explanation:
 * //  - scan accumulates values over time using a reducer function
 * //  - Starting with seed value 0, each emission adds to the accumulator
 * //  - Similar to Array.reduce, but for streams
 *
 * const num$ = source<number>();
 *
 * const sum$ = num$.pipe(scan((acc, curr) => acc + curr, 0));
 *
 * const mut_history: number[] = [];
 *
 * sum$.subscribe((x) => {
 *   mut_history.push(x);
 * });
 *
 * assert.deepStrictEqual(mut_history, [0]);
 *
 * num$.next(1); // logs: 1
 *
 * assert.deepStrictEqual(mut_history, [0, 1]);
 *
 * num$.next(2); // logs: 3
 *
 * assert.deepStrictEqual(mut_history, [0, 1, 3]);
 *
 * num$.next(3); // logs: 6
 *
 * assert.deepStrictEqual(mut_history, [0, 1, 3, 6]);
 * ```
 */
export const scan =
  <A, B>(
    reducer: (acc: B, curr: A) => B,
    initialValue: B,
  ): WithInitialValueOperator<A, B> =>
  (parentObservable) =>
    new ScanObservableClass(parentObservable, reducer, initialValue);

class ScanObservableClass<A, B>
  extends InitializedSyncChildObservableClass<B, readonly [A]>
  implements ScanOperatorObservable<A, B>
{
  readonly #reducer: (acc: B, curr: A) => B;

  constructor(
    parentObservable: Observable<A>,
    reducer: (acc: B, curr: A) => B,
    initialValue: B,
  ) {
    super({
      parents: [parentObservable],
      initialValue: Optional.some(initialValue),
    });

    this.#reducer = reducer;
  }

  override tryUpdate(updaterSymbol: UpdaterSymbol): void {
    const par = this.parents[0];

    const psn = par.getSnapshot();

    const sn = this.getSnapshot();

    if (
      par.updaterSymbol !== updaterSymbol ||
      Optional.isNone(psn) ||
      Optional.isNone(sn)
    ) {
      return; // skip update
    }

    this.setNext(this.#reducer(sn.value, psn.value), updaterSymbol);
  }
}
