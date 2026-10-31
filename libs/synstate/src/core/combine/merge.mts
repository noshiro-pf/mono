// Sumi bans classes, `this`, method syntax and writes to `this` outside a
// `mut_` binding; an observable is a class (`ObservableBaseClass` says why), so
// those rules are waived here (D-63).
// @sumi-expect-error-file classes/no-class
// @sumi-expect-error-file banned-syntax/no-this
// @sumi-expect-error-file functions/prefer-arrow-function
import { Optional, expectType } from 'ts-data-forge';
import type { ArrayElement, NonEmptyTuple } from 'ts-type-forge';
import { SyncChildObservableClass } from '../class/index.mjs';
import { source } from '../create/index.mjs';
import type {
  MergeObservable,
  MergeObservableRefined,
  NonEmptyUnknownList,
  Observable,
  SyncChildObservable,
  UpdateToken,
  Wrap,
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
 */
export const merge = <const OS extends NonEmptyTuple<Observable<unknown>>>(
  parents: OS,
): MergeObservableRefined<OS> =>
  // @sumi-expect-error banned-syntax/no-unsafe-type-assertion
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

    this.attach();
  }

  override tryUpdate(updateToken: UpdateToken): void {
    const parentToUse = this.parents.find(
      (o) => o.updateToken === updateToken && Optional.isSome(o.getSnapshot()),
    );

    if (parentToUse === undefined) {
      return;
    }

    const nextValue =
      // @sumi-expect-error banned-syntax/no-unsafe-type-assertion
      Optional.unwrap(parentToUse.getSnapshot()) as ArrayElement<P>;

    this.setNext(nextValue, updateToken);
  }
}

if (import.meta.vitest !== undefined) {
  test('type test', () => {
    expect(1).toBe(1); // dummy
  });

  const r1 = source(1);

  const r2 = source('a');

  const _m = merge([r1, r2]);

  expectType<typeof _m, SyncChildObservable<number | string>>('<=');
}
