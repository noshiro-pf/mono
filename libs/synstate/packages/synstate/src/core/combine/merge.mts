import { Optional, expectType } from 'ts-data-forge';
import { SyncChildObservableClass } from '../class/index.mjs';
import { fromArray } from '../create/index.mjs';
import {
  type MergeObservable,
  type MergeObservableRefined,
  type NonEmptyUnknownList,
  type Observable,
  type SyncChildObservable,
  type UpdaterSymbol,
  type Wrap,
} from '../types/index.mjs';

/**
 * Merges multiple observables into a single observable that emits all values from all sources.
 * Emits whenever any source observable emits a value.
 *
 * @template OS - Tuple type of source observables
 * @param parents - Array of observables to merge
 * @returns A merged observable emitting values from any source
 *
 * @example
 * ```ts
 * //  Timeline:
 * //
 * //  clicks$   c1          c2                    c3
 * //  keys$               k1          k2                    k3
 * //  events$   c1        k1    c2    k2          c3        k3
 * //
 * //  Explanation:
 * //  - merge combines multiple observables into one
 * //  - Emits values from any source as they arrive
 * //  - Order is preserved based on emission time
 *
 * const clicks$ = source<string>();
 *
 * const keys$ = source<string>();
 *
 * const events$ = merge([clicks$, keys$]);
 *
 * const mut_history: string[] = [];
 *
 * events$.subscribe((event_) => {
 *   mut_history.push(event_);
 * });
 *
 * clicks$.next('c1');
 *
 * assert.deepStrictEqual(mut_history, ['c1']);
 *
 * keys$.next('k1');
 *
 * assert.deepStrictEqual(mut_history, ['c1', 'k1']);
 *
 * clicks$.next('c2');
 *
 * keys$.next('k2');
 *
 * assert.deepStrictEqual(mut_history, ['c1', 'k1', 'c2', 'k2']);
 * ```
 *
 * @note To improve code readability, consider using `createState` instead of `merge`,
 * subscribing to `parents` and calling `setState` within it.
 */
export const merge = <const OS extends NonEmptyArray<Observable<unknown>>>(
  parents: OS,
): MergeObservableRefined<OS> =>
  // eslint-disable-next-line total-functions/no-unsafe-type-assertion
  new MergeObservableClass(parents) as MergeObservableRefined<OS>;

class MergeObservableClass<const P extends NonEmptyUnknownList>
  extends SyncChildObservableClass<ArrayElement<P>, P>
  implements MergeObservable<P>
{
  constructor(parents: Wrap<P>) {
    super({
      parents,
      initialValue: Optional.none,
    });
  }

  override tryUpdate(updaterSymbol: UpdaterSymbol): void {
    const parentToUse = this.parents.find(
      (o) =>
        o.updaterSymbol === updaterSymbol && Optional.isSome(o.getSnapshot()),
    );

    if (parentToUse === undefined) return;

    const nextValue =
      // eslint-disable-next-line total-functions/no-unsafe-type-assertion
      Optional.unwrap(parentToUse.getSnapshot()) as ArrayElement<P>;

    this.setNext(nextValue, updaterSymbol);
  }
}

if (import.meta.vitest !== undefined) {
  test('type test', () => {
    expect(1).toBe(1); // dummy
  });

  const r1 = fromArray([1, 2, 3]);

  const r2 = fromArray(['a', 'b', 'c']);

  const _m = merge([r1, r2] as const);

  expectType<typeof _m, SyncChildObservable<number | string>>('<=');
}
