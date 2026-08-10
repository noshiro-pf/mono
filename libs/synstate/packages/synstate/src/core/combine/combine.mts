import { Arr, expectType, Optional } from 'ts-data-forge';
import { type NonEmptyTuple, type Tuple } from 'ts-type-forge';
import { SyncChildObservableClass } from '../class/index.mjs';
import { source } from '../create/index.mjs';
import { withInitialValue } from '../operators/index.mjs';
import {
  type CombineObservable,
  type CombineObservableRefined,
  type InitializedObservable,
  type InitializedSyncChildObservable,
  type NonEmptyUnknownList,
  type Observable,
  type SyncChildObservable,
  type UpdateToken,
  type Wrap,
} from '../types/index.mjs';

/**
 * Combines multiple observables into a single observable that emits an array of their latest values.
 * Emits whenever any of the source observables emit, but only after all sources have emitted at least once.
 *
 * @template OS - Tuple type of source observables
 * @param parents - Array of observables to combine
 * @returns A combined observable emitting tuples of values
 *
 * @example
 * ```ts
 * //  Timeline:
 * //
 * //  name$     "Alice"                 "Bob"
 * //  age$                25                        30
 * //  user$               ["Alice",25]  ["Bob",25]  ["Bob",30]
 * //
 * //  Explanation:
 * //  - combine waits for all sources to emit at least once
 * //  - Then emits the latest value from all sources whenever any source emits
 * //  - Always emits an array with the latest values from each source
 *
 * const name$ = source<string>();
 *
 * const age$ = source<number>();
 *
 * const user$ = combine([name$, age$]);
 *
 * const userHistory: (readonly [string, number])[] = [];
 *
 * user$.subscribe(([name_, age]) => {
 *   userHistory.push([name_, age]);
 * });
 *
 * name$.next('Alice'); // nothing logged (age$ hasn't emitted yet)
 *
 * assert.deepStrictEqual(userHistory, []);
 *
 * age$.next(25); // logs: { name: 'Alice', age: 25 }
 *
 * assert.deepStrictEqual(userHistory, [['Alice', 25]]);
 *
 * name$.next('Bob'); // logs: { name: 'Bob', age: 25 }
 *
 * assert.deepStrictEqual(userHistory, [
 *   ['Alice', 25],
 *   ['Bob', 25],
 * ]);
 *
 * age$.next(30); // logs: { name: 'Bob', age: 30 }
 *
 * assert.deepStrictEqual(userHistory, [
 *   ['Alice', 25],
 *   ['Bob', 25],
 *   ['Bob', 30],
 * ]);
 * ```
 */
export const combine = <const OS extends NonEmptyTuple<Observable<unknown>>>(
  parents: OS,
): CombineObservableRefined<OS> =>
  // eslint-disable-next-line total-functions/no-unsafe-type-assertion
  new CombineObservableClass(
    parents,
  ) as unknown as CombineObservableRefined<OS>;

/**
 * Alias for `combine`.
 * @see combine
 */
export const combineLatest = combine;

class CombineObservableClass<const A extends NonEmptyUnknownList>
  extends SyncChildObservableClass<A, A>
  implements CombineObservable<A>
{
  constructor(parents: Wrap<A>) {
    const parentsValues: Tuple.MapTo<Optional<A[number]>, A> = Arr.map(
      parents,
      (p) => p.getSnapshot(),
    );

    // The annotation on `initialValue` is what replaces the type assertion.
    // `Arr.map` carries a single result element type, so it reports `A[number]`
    // at every position, and `Tuple.MapTo<A[number], A>` — the uniform mapping
    // — is *not* assignable back to `A`. The positional
    // `Readonly<{ [K in keyof A]: A[K] }>` is, and TypeScript accepts the
    // uniform result into it because the two mapped types share `keyof A`. So
    // it is the annotation, not an assertion, that records the position-wise
    // fact the checker cannot derive on its own.
    const initialValue: Optional<Readonly<{ [K in keyof A]: A[K] }>> =
      Arr.every(parentsValues, Optional.isSome)
        ? Optional.some(Arr.map(parentsValues, (c) => c.value))
        : Optional.none;

    super({
      parents,
      initialValue,
    });
  }

  override tryUpdate(updateToken: UpdateToken): void {
    if (this.parents.every((o) => o.updateToken !== updateToken)) return; // all parents are skipped

    // Same shape-preserving chain as the constructor: `Arr.map` (not the
    // native one, which drops the tuple shape) into the uniform
    // `Tuple.MapTo`, then a positional annotation to get back to `A`.
    const parentValues: Tuple.MapTo<Optional<A[number]>, A> = Arr.map(
      this.parents,
      (a) => a.getSnapshot(),
    );

    if (Arr.every(parentValues, Optional.isSome)) {
      const nextValue: Readonly<{ [K in keyof A]: A[K] }> = Arr.map(
        parentValues,
        (a) => a.value,
      );

      this.setNext(nextValue, updateToken);
    }
  }
}

if (import.meta.vitest !== undefined) {
  test('type test', () => {
    expect(1).toBe(1); // dummy
  });

  {
    const s1: Observable<1> = source<1>();

    const s2: Observable<2> = source<2>();

    const _d = combine([s1, s2]);

    expectType<typeof _d, CombineObservable<readonly [1, 2]>>('=');

    expectType<typeof _d, Observable<readonly [1, 2]>>('<=');
  }

  {
    const s1: InitializedObservable<1> = source<1>().pipe(withInitialValue(1));

    const s2: Observable<2> = source<2>();

    const _d = combine([s1, s2]);

    expectType<typeof _d, CombineObservable<readonly [1, 2]>>('=');

    expectType<typeof _d, Observable<readonly [1, 2]>>('<=');
  }

  {
    const s1: InitializedObservable<1> = source<1>().pipe(withInitialValue(1));

    const s2: InitializedObservable<2> = source<2>().pipe(withInitialValue(2));

    const _d = combine([s1, s2]);

    // Returns InitializedObservable if all OS are InitializedObservable
    expectType<typeof _d, InitializedObservable<readonly [1, 2]>>('<=');
  }

  const r1 = source(1);

  const r2 = source('a');

  const _c = combine([r1, r2]);

  const _ci = combine([
    r1.pipe(withInitialValue(0)),
    r2.pipe(withInitialValue(0)),
  ]);

  expectType<typeof _c, SyncChildObservable<readonly [number, string]>>('<=');

  expectType<
    typeof _ci,
    InitializedSyncChildObservable<readonly [number, number | string]>
  >('<=');
}
