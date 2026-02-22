import { Optional, SafeUint, asSafeUint, pipe } from 'ts-data-forge';
import { SyncChildObservableClass } from '../class/index.mjs';
import {
  type DropInitialValueOperator,
  type Observable,
  type SkipWhileOperatorObservable,
  type UpdaterSymbol,
} from '../types/index.mjs';

/**
 * Skips values from the source observable while the predicate returns true.
 * Once the predicate returns false, all subsequent values pass through.
 *
 * @template A - The type of values from the source
 * @param predicate - Function to test each value
 * @returns An operator that skips values while the predicate is true
 *
 * @example
 * ```ts
 * //  Timeline:
 * //
 * //  num$        1     2     3     4     5     6     7
 * //  skipped$                      5     6     7
 * //              |---- skip -----|
 * //
 * //  Explanation:
 * //  - skipWhile skips values while the predicate returns true
 * //  - Once the predicate returns false, all subsequent values pass through
 * //  - Unlike filter, the predicate is never checked again after the first false
 *
 * const num$ = source<number>();
 *
 * const skipped$ = num$.pipe(skipWhile((x) => x < 5));
 *
 * const mut_history: number[] = [];
 *
 * skipped$.subscribe((x) => {
 *   mut_history.push(x);
 * });
 *
 * num$.next(1); // nothing logged
 *
 * num$.next(2); // nothing logged
 *
 * num$.next(5); // logs: 5
 *
 * assert.deepStrictEqual(mut_history, [5]);
 *
 * num$.next(6); // logs: 6
 *
 * assert.deepStrictEqual(mut_history, [5, 6]);
 *
 * num$.next(7); // logs: 7
 *
 * assert.deepStrictEqual(mut_history, [5, 6, 7]);
 * ```
 */
export const skipWhile =
  <A,>(
    predicate: (value: A, index: SafeUint | -1) => boolean,
  ): DropInitialValueOperator<A, A> =>
  (parentObservable) =>
    new SkipWhileObservableClass(parentObservable, predicate);

/* implementation */

class SkipWhileObservableClass<A>
  extends SyncChildObservableClass<A, readonly [A]>
  implements SkipWhileOperatorObservable<A>
{
  readonly #predicate: (value: A, index: SafeUint | -1) => boolean;
  #mut_index: SafeUint | -1;

  constructor(
    parentObservable: Observable<A>,
    predicate: (value: A, index: SafeUint | -1) => boolean,
  ) {
    super({
      parents: [parentObservable],
      initialValue: pipe(parentObservable.getSnapshot()).map((sn) =>
        Optional.isNone(sn)
          ? Optional.none
          : predicate(sn.value, -1)
            ? Optional.none
            : sn,
      ).value,
    });

    this.#mut_index = -1;

    this.#predicate = predicate;
  }

  override tryUpdate(updaterSymbol: UpdaterSymbol): void {
    const par = this.parents[0];

    const sn = par.getSnapshot();

    if (par.updaterSymbol !== updaterSymbol || Optional.isNone(sn)) {
      return; // skip update
    }

    this.#mut_index =
      this.#mut_index === -1 ? asSafeUint(0) : SafeUint.add(1, this.#mut_index);

    if (!this.#predicate(sn.value, this.#mut_index)) {
      this.setNext(sn.value, updaterSymbol);
    }
  }
}
