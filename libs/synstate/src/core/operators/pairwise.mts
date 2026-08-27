import { Optional } from 'ts-data-forge';
import { type FixedLengthTuple } from 'ts-type-forge';
import { createSyncChildObservable } from '../base/index.mjs';
import {
  type DropInitialValueOperator,
  type Observable,
  type PairwiseOperatorObservable,
} from '../types/index.mjs';

/**
 * Emits the previous and current values as a pair.
 * Does not emit until the source has emitted at least twice.
 *
 * @template A - The type of values from the source
 * @returns An operator that pairs consecutive values
 *
 * @example
 * ```ts
 * //  Timeline:
 * //
 * //  num$      1     2     3     4
 * //  pairs$          [1,2] [2,3] [3,4]
 * //
 * //  Explanation:
 * //  - pairwise emits the current and previous values as a tuple
 * //  - Nothing is emitted for the first value (no previous value yet)
 * //  - Useful for tracking changes between consecutive values
 *
 * const num$ = source<number>();
 *
 * const pairs$ = num$.pipe(pairwise());
 *
 * const valueHistory: FixedLengthTuple<2, number>[] = [];
 *
 * pairs$.subscribe(([prev, curr]) => {
 *   valueHistory.push([prev, curr]);
 * });
 *
 * num$.next(1); // nothing logged
 *
 * assert.deepStrictEqual(valueHistory, []);
 *
 * num$.next(2); // logs: 1, 2
 *
 * assert.deepStrictEqual(valueHistory, [[1, 2]]);
 *
 * num$.next(3); // logs: 2, 3
 *
 * assert.deepStrictEqual(valueHistory, [
 *   [1, 2],
 *   [2, 3],
 * ]);
 *
 * num$.next(4); // logs: 3, 4
 *
 * assert.deepStrictEqual(valueHistory, [
 *   [1, 2],
 *   [2, 3],
 *   [3, 4],
 * ]);
 * ```
 */
export const pairwise = <A,>(): DropInitialValueOperator<
  A,
  FixedLengthTuple<2, A>
> => f;

const f = <A,>(
  parentObservable: Observable<A>,
): Observable<FixedLengthTuple<2, A>> =>
  createPairwiseObservable(parentObservable);

const createPairwiseObservable = <A,>(
  parentObservable: Observable<A>,
): PairwiseOperatorObservable<A> =>
  createSyncChildObservable<FixedLengthTuple<2, A>, readonly [A]>(
    {
      parents: [parentObservable],
      initialValue: Optional.none,
    },
    ({ setNext }) => {
      // parentObservable.snapshot has value
      // if parentObservable is InitializedObservable
      let mut_previousValue: Optional<A> = parentObservable.getSnapshot();

      return (updateToken) => {
        const sn = parentObservable.getSnapshot();

        if (
          parentObservable.updateToken !== updateToken ||
          Optional.isNone(sn)
        ) {
          return; // skip update
        }

        const prev = mut_previousValue;

        const cond = !Optional.isNone(prev);

        // NOTE: Must update before setNext, otherwise Optional.isNone(prev) remains true when tryUpdate is called consecutively
        mut_previousValue = parentObservable.getSnapshot();

        if (cond) {
          setNext([prev.value, sn.value], updateToken);
        }
      };
    },
  );
