import { Optional } from 'ts-data-forge';
import { createSyncChildObservable } from '../base/index.mjs';
import {
  type KeepInitialValueOperator,
  type Observable,
  type SkipIfNoChangeOperatorObservable,
} from '../types/index.mjs';

/**
 * Skips emissions if the value hasn't changed from the previous emission.
 * Uses a custom equality function or Object.is by default.
 *
 * @template A - The type of values from the source
 * @param eq - Equality comparison function (default: Object.is)
 * @returns An operator that skips duplicate consecutive values
 *
 * @example
 * ```ts
 * //  Timeline:
 * //
 * //  num$      1     1     2     2     1     2     3     2
 * //  distinct$ 1           2           1     2     3     2
 * //
 * //  Explanation:
 * //  - skipIfNoChange filters out consecutive duplicate values
 * //  - Uses strict equality (===) for comparison
 * //  - Only emits when the value actually changes
 *
 * const num$ = source<number>();
 *
 * const distinct$ = num$.pipe(skipIfNoChange());
 *
 * const valueHistory: number[] = [];
 *
 * distinct$.subscribe((x) => {
 *   valueHistory.push(x);
 * });
 *
 * num$.next(1); // logs: 1
 *
 * assert.deepStrictEqual(valueHistory, [1]);
 *
 * num$.next(1); // nothing logged
 *
 * assert.deepStrictEqual(valueHistory, [1]);
 *
 * num$.next(2); // logs: 2
 *
 * assert.deepStrictEqual(valueHistory, [1, 2]);
 *
 * num$.next(2); // nothing logged
 *
 * num$.next(1); // logs: 1
 *
 * assert.deepStrictEqual(valueHistory, [1, 2, 1]);
 *
 * num$.next(2); // logs: 2
 *
 * assert.deepStrictEqual(valueHistory, [1, 2, 1, 2]);
 *
 * num$.next(3); // logs: 3
 *
 * assert.deepStrictEqual(valueHistory, [1, 2, 1, 2, 3]);
 *
 * num$.next(2); // logs: 2
 *
 * assert.deepStrictEqual(valueHistory, [1, 2, 1, 2, 3, 2]);
 * ```
 */
export const skipIfNoChange = <A,>(
  eq: (x: A, y: A) => boolean = (x, y) => Object.is(x, y),
): KeepInitialValueOperator<A, A> =>
  // eslint-disable-next-line total-functions/no-unsafe-type-assertion
  ((parentObservable) =>
    createSkipIfNoChangeObservable(
      parentObservable,
      eq,
    )) as KeepInitialValueOperator<A, A>;

/**
 * Alias for `skipIfNoChange`.
 * @see skipIfNoChange
 */
export const distinctUntilChanged = skipIfNoChange;

const createSkipIfNoChangeObservable = <A,>(
  parentObservable: Observable<A>,
  eq: (x: A, y: A) => boolean,
): SkipIfNoChangeOperatorObservable<A> =>
  createSyncChildObservable(
    {
      parents: [parentObservable],
      initialValue: parentObservable.getSnapshot(),
    },
    ({ setNext }) => {
      // parentObservable.snapshot has value
      // if parentObservable is InitializedObservable
      let mut_previousValue: Optional<A> = parentObservable.getSnapshot();

      return (updateToken) => {
        const par = parentObservable;

        const sn = par.getSnapshot();

        if (par.updateToken !== updateToken || Optional.isNone(sn)) {
          return; // skip update
        }

        const prev = mut_previousValue;

        const cond = Optional.isNone(prev) || !eq(prev.value, sn.value);

        // NOTE: Must update before setNext, otherwise Optional.isNone(prev) remains true when tryUpdate is called consecutively
        mut_previousValue = sn;

        if (cond) {
          setNext(sn.value, updateToken);
        }
      };
    },
  );
