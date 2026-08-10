import { PositiveSafeInt } from 'ts-data-forge';
import { type PositiveSafeIntWithSmallInt } from 'ts-type-forge';
import { skipWhile } from '../../operators/index.mjs';
import { type DropInitialValueOperator } from '../../types/index.mjs';

/**
 * Skips the first `n` emissions from the source observable.
 * After `n` values are skipped, all subsequent values pass through.
 *
 * @template A - The type of values from the source
 * @param n - The number of values to skip
 * @returns An operator that skips the first n emissions
 *
 * @example
 * ```ts
 * //  Timeline:
 * //
 * //  num$      1     2     3     4     5
 * //  skipped$              3     4     5
 * //            |skip 2|
 * //
 * //  Explanation:
 * //  - skip ignores the first n emissions from the source
 * //  - After n values are skipped, all subsequent values pass through
 *
 * const num$ = source<number>();
 *
 * const skipped$ = num$.pipe(skip(2));
 *
 * const valueHistory: number[] = [];
 *
 * skipped$.subscribe((x) => {
 *   valueHistory.push(x);
 * });
 *
 * num$.next(1); // skipped
 *
 * num$.next(2); // skipped
 *
 * assert.deepStrictEqual(valueHistory, []);
 *
 * num$.next(3); // logs: 3
 *
 * assert.deepStrictEqual(valueHistory, [3]);
 *
 * num$.next(4); // logs: 4
 *
 * num$.next(5); // logs: 5
 *
 * assert.deepStrictEqual(valueHistory, [3, 4, 5]);
 * ```
 */
export const skip = <A,>(
  n: PositiveSafeIntWithSmallInt,
): DropInitialValueOperator<A, A> =>
  !PositiveSafeInt.is(n) ? idFn : skipWhile((_, index) => index + 1 <= n);

const idFn = <T,>(value: T): T => value;
