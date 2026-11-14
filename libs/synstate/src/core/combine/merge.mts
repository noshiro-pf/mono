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
import { withInitialValue } from '../operators/index.mjs';
import type {
  InitializedObservable,
  MergeObservable,
  MergeObservableRefined,
  NonEmptyUnknownList,
  Observable,
  SyncChildObservable,
  UpdateToken,
  Wrap,
} from '../types/index.mjs';

/**
 * Merges several observables into one that emits whenever any of them emits, at most once per update.
 * It holds no value until a source emits, even when its sources hold one.
 * Pipe `withInitialValue` after it where a value is needed from the start.
 *
 * When several sources emit in the same update, for example an observable and what is mapped from it, `merge` passes on the value of the first of them in the order of `parents`, and the other values of that update are not passed on.
 * Use `combine` or `derive` to read them together.
 *
 * @template OS - Tuple type of source observables
 * @param parents - Array of observables to merge
 * @returns The merged observable
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
 * //  - events$ emits c1, k1, c2 and k2 in the order they are written, each in its own update
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
    // The first parent in `parents` that emitted in this update wins and the
    // others' values are dropped, as the JSDoc documents; that is intended, not
    // a case to warn about. A parent that a nested update (a write during
    // propagation, which synstate warns against) made emit again carries that
    // update's token and is skipped, as in every node; the JSDoc, like every
    // operator's, describes writes made outside an update.
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

  // Initialized sources do not make the merged observable initialized.
  const a$: InitializedObservable<number> = source<number>().pipe(
    withInitialValue(1),
  );

  const _m2 = merge([a$, source<string>()]);

  expectType<typeof _m2, Observable<number | string>>('<=');

  expectType<typeof _m2, InitializedObservable<number | string>>('!<=');

  const _m3 = merge([a$, a$]);

  expectType<typeof _m3, InitializedObservable<number>>('!<=');
}
