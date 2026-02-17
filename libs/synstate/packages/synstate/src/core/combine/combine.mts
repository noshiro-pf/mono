import { Arr, Optional, expectType } from 'ts-data-forge';
import { SyncChildObservableClass } from '../class/index.mjs';
import { fromArray, source } from '../create/index.mjs';
import { withInitialValue } from '../operators/index.mjs';
import {
  type CombineObservable,
  type CombineObservableRefined,
  type InitializedObservable,
  type InitializedSyncChildObservable,
  type NonEmptyUnknownList,
  type Observable,
  type SyncChildObservable,
  type UpdaterSymbol,
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
 * const name$ = source<string>();
 *
 * const age$ = source<number>();
 *
 * const user$ = combine([name$, age$]);
 *
 * user$.subscribe(([name_, age]) => {
 *   console.log({ name: name_, age });
 * });
 *
 * name$.next('Alice');
 *
 * age$.next(25); // logs: { name: 'Alice', age: 25 }
 *
 * name$.next('Bob'); // logs: { name: 'Bob', age: 25 }
 * ```
 */
export const combine = <const OS extends NonEmptyArray<Observable<unknown>>>(
  parents: OS,
): CombineObservableRefined<OS> =>
  // eslint-disable-next-line total-functions/no-unsafe-type-assertion
  new CombineObservableClass(
    parents,
  ) as unknown as CombineObservableRefined<OS>;

/**
 * Alias for `combine()`.
 * @see combine
 */
export const combineLatest = combine; // alias

class CombineObservableClass<const A extends NonEmptyUnknownList>
  extends SyncChildObservableClass<A, A>
  implements CombineObservable<A>
{
  constructor(parents: Wrap<A>) {
    const parentsValues = parents.map((p) => p.getSnapshot());

    super({
      parents,
      initialValue: parentsValues.every(Optional.isSome)
        ? Optional.some(
            // eslint-disable-next-line total-functions/no-unsafe-type-assertion
            Arr.map(parentsValues, (c) => c.value) as A,
          )
        : Optional.none,
    });
  }

  override tryUpdate(updaterSymbol: UpdaterSymbol): void {
    if (this.parents.every((o) => o.updaterSymbol !== updaterSymbol)) return; // all parents are skipped

    const parentValues = this.parents.map((a) => a.getSnapshot());

    if (parentValues.every(Optional.isSome)) {
      const nextValue =
        // eslint-disable-next-line total-functions/no-unsafe-type-assertion
        Arr.map(parentValues, (a) => a.value) as A;

      this.setNext(nextValue, updaterSymbol);
    }
  }
}

{
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

  const r1 = fromArray([1, 2, 3]);

  const r2 = fromArray(['a', 'b', 'c']);

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
