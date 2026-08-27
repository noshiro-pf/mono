import { Optional, expectType } from 'ts-data-forge';
import { type ArrayElement, type NonEmptyTuple } from 'ts-type-forge';
import { createSyncChildObservable } from '../base/index.mjs';
import { source } from '../create/index.mjs';
import {
  type MergeObservable,
  type MergeObservableRefined,
  type NonEmptyUnknownList,
  type Observable,
  type SyncChildObservable,
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
 * //  clicks$   c1              c2                c3
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
 * const valueHistory: string[] = [];
 *
 * events$.subscribe((event_) => {
 *   valueHistory.push(event_);
 * });
 *
 * clicks$.next('c1');
 *
 * assert.deepStrictEqual(valueHistory, ['c1']);
 *
 * keys$.next('k1');
 *
 * assert.deepStrictEqual(valueHistory, ['c1', 'k1']);
 *
 * clicks$.next('c2');
 *
 * keys$.next('k2');
 *
 * assert.deepStrictEqual(valueHistory, ['c1', 'k1', 'c2', 'k2']);
 * ```
 *
 * @note To improve code readability, consider using `createState` instead of `merge`,
 * subscribing to `parents` and calling `setState` within it.
 */
export const merge = <const OS extends NonEmptyTuple<Observable<unknown>>>(
  parents: OS,
): MergeObservableRefined<OS> =>
  // eslint-disable-next-line total-functions/no-unsafe-type-assertion
  createMergeObservable(parents) as MergeObservableRefined<OS>;

const createMergeObservable = <const P extends NonEmptyUnknownList>(
  parents: Wrap<P>,
): MergeObservable<P> =>
  createSyncChildObservable<ArrayElement<P>, P>(
    {
      parents,
      initialValue: Optional.none,
    },
    ({ setNext }) =>
      (updateToken) => {
        const parentToUse = parents.find(
          (o) =>
            o.updateToken === updateToken && Optional.isSome(o.getSnapshot()),
        );

        if (parentToUse === undefined) return;

        const nextValue =
          // eslint-disable-next-line total-functions/no-unsafe-type-assertion
          Optional.unwrap(parentToUse.getSnapshot()) as ArrayElement<P>;

        setNext(nextValue, updateToken);
      },
  );

if (import.meta.vitest !== undefined) {
  test('type test', () => {
    expect(1).toBe(1); // dummy
  });

  const r1 = source(1);

  const r2 = source('a');

  const _m = merge([r1, r2]);

  expectType<typeof _m, SyncChildObservable<number | string>>('<=');
}
