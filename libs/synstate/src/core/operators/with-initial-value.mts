import { expectType, Optional } from 'ts-data-forge';
import { createInitializedSyncChildObservable } from '../base/index.mjs';
import { source } from '../create/index.mjs';
import {
  type InitializedObservable,
  type Observable,
  type WithInitialValueOperator,
  type WithInitialValueOperatorObservable,
} from '../types/index.mjs';

/**
 * Provides an initial value for an observable that doesn't have one.
 * The resulting observable will immediately emit the initial value upon subscription,
 * and then emit all subsequent values from the source.
 *
 * @template A - The type of values from the source
 * @template I - The type of the initial value (defaults to A)
 * @param initialValue - The initial value to emit
 * @returns An operator that sets the initial value
 *
 * @example
 * ```ts
 * //  Timeline:
 * //
 * //  num$             1    2    3
 * //  withInitial$ 0   1    2    3
 * //               ^
 * //               initial value
 * //
 * //  Explanation:
 * //  - withInitialValue provides an initial value before the source emits
 * //  - Converts an uninitialized observable to an initialized one
 * //  - Useful when you need a default value immediately
 *
 * const num$ = source<number>();
 *
 * const initialized$ = num$.pipe(withInitialValue(0));
 *
 * const valueHistory: number[] = [];
 *
 * initialized$.subscribe((x) => {
 *   valueHistory.push(x);
 * });
 *
 * assert.deepStrictEqual(valueHistory, [0]);
 *
 * num$.next(1); // logs: 1
 *
 * assert.deepStrictEqual(valueHistory, [0, 1]);
 *
 * num$.next(2); // logs: 2
 *
 * assert.deepStrictEqual(valueHistory, [0, 1, 2]);
 * ```
 */
export const withInitialValue =
  <A, I = A>(initialValue: I): WithInitialValueOperator<A, A | I> =>
  (parentObservable) =>
    createWithInitialValueObservable(parentObservable, initialValue);

const createWithInitialValueObservable = <A, I>(
  parentObservable: Observable<A>,
  initialValue: I,
): WithInitialValueOperatorObservable<A, I> =>
  createInitializedSyncChildObservable<A | I, readonly [A]>(
    {
      parents: [parentObservable],
      initialValue: Optional.some(initialValue),
    },
    ({ setNext }) =>
      (updateToken) => {
        const par = parentObservable;

        const sn = par.getSnapshot();

        if (par.updateToken !== updateToken || Optional.isNone(sn)) {
          return; // skip update
        }

        setNext(sn.value, updateToken);
      },
  );

if (import.meta.vitest !== undefined) {
  test('type test', () => {
    expect(1).toBe(1); // dummy
  });

  {
    const s = source<number>();

    const _d: InitializedObservable<number> = s.pipe(withInitialValue(0));

    expectType<typeof _d, InitializedObservable<number>>('=');
  }
}
