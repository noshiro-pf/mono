import { type PositiveSafeIntWithSmallInt } from 'ts-type-forge';
import { takeWhile } from '../../operators/index.mjs';
import { type DropInitialValueOperator } from '../../types/index.mjs';

/**
 * Takes only the first `n` emissions from the source observable, then completes.
 *
 * @template A - The type of values from the source
 * @param n - The number of values to take
 * @returns An operator that takes the first n emissions
 *
 * @example
 * ```ts
 * //  Timeline:
 * //
 * //  num$    1     2     3     4 (ignored)
 * //  taken$  1     2     3     | (completes)
 * //
 * //  Explanation:
 * //  - take emits only the first n values, then completes
 * //  - Subsequent emissions from the source are ignored
 *
 * const num$ = source<number>();
 *
 * const taken$ = num$.pipe(take(3));
 *
 * const valueHistory: number[] = [];
 *
 * taken$.subscribe((x) => {
 *   valueHistory.push(x);
 * });
 *
 * num$.next(1);
 *
 * num$.next(2);
 *
 * num$.next(3);
 *
 * assert.deepStrictEqual(valueHistory, [1, 2, 3]);
 *
 * num$.next(4); // ignored (already completed)
 *
 * assert.deepStrictEqual(valueHistory, [1, 2, 3]);
 * ```
 */
export const take = <A,>(
  n: PositiveSafeIntWithSmallInt,
): DropInitialValueOperator<A, A> => takeWhile((_, index) => index + 1 <= n);
