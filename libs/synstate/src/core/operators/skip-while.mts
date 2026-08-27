import { Optional, SafeUint, asSafeUint, pipe } from 'ts-data-forge';
import { createSyncChildObservable } from '../base/index.mjs';
import {
  type DropInitialValueOperator,
  type Observable,
  type SkipWhileOperatorObservable,
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
 * //  num$        1     2     3     4     5     6     7     1     2
 * //  skipped$                            5     6     7     1     2
 * //              |-------- skip --------|
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
 * const valueHistory: number[] = [];
 *
 * skipped$.subscribe((x) => {
 *   valueHistory.push(x);
 * });
 *
 * num$.next(1); // nothing logged
 *
 * num$.next(2); // nothing logged
 *
 * num$.next(3); // nothing logged
 *
 * num$.next(4); // nothing logged
 *
 * num$.next(5); // logs: 5
 *
 * assert.deepStrictEqual(valueHistory, [5]);
 *
 * num$.next(6); // logs: 6
 *
 * assert.deepStrictEqual(valueHistory, [5, 6]);
 *
 * num$.next(7); // logs: 7
 *
 * assert.deepStrictEqual(valueHistory, [5, 6, 7]);
 *
 * num$.next(1); // logs: 1
 *
 * num$.next(2); // logs: 2
 *
 * assert.deepStrictEqual(valueHistory, [5, 6, 7, 1, 2]);
 * ```
 */
export const skipWhile =
  <A,>(
    predicate: (value: A, index: SafeUint | -1) => boolean,
  ): DropInitialValueOperator<A, A> =>
  (parentObservable) =>
    createSkipWhileObservable(parentObservable, predicate);

/* implementation */

const createSkipWhileObservable = <A,>(
  parentObservable: Observable<A>,
  predicate: (value: A, index: SafeUint | -1) => boolean,
): SkipWhileOperatorObservable<A> =>
  createSyncChildObservable(
    {
      parents: [parentObservable],
      initialValue: pipe(parentObservable.getSnapshot()).map((sn) =>
        Optional.isNone(sn) || predicate(sn.value, -1) ? Optional.none : sn,
      ).value,
    },
    ({ setNext }) => {
      let mut_index: SafeUint | -1 = -1;

      let mut_skipping = true;

      return (updateToken) => {
        const sn = parentObservable.getSnapshot();

        if (
          parentObservable.updateToken !== updateToken ||
          Optional.isNone(sn)
        ) {
          return; // skip update
        }

        mut_index =
          mut_index === -1 ? asSafeUint(0) : SafeUint.add(1, mut_index);

        if (!predicate(sn.value, mut_index)) {
          mut_skipping = false;
        }

        if (!mut_skipping) {
          setNext(sn.value, updateToken);
        }
      };
    },
  );
