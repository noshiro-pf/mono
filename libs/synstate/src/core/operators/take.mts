// Sumi bans classes, `this`, method syntax and writes to `this` outside a
// `mut_` binding; an observable is a class (`ObservableBaseClass` says why), so
// those rules are waived here (D-63).
// @sumi-expect-error-file classes/no-class
// @sumi-expect-error-file banned-syntax/no-this
// @sumi-expect-error-file functions/prefer-arrow-function
// @sumi-expect-error-file mutation/no-mutation-without-mut-prefix
import { Optional, expectType } from 'ts-data-forge';
import type { PositiveSafeIntWithSmallInt } from 'ts-type-forge';
import { SyncChildObservableClass } from '../class/index.mjs';
import { source } from '../create/index.mjs';
import type {
  DropInitialValueOperator,
  InitializedObservable,
  Observable,
  TakeOperatorObservable,
  UpdateToken,
} from '../types/index.mjs';
import { withInitialValue } from './with-initial-value.mjs';

/**
 * Takes only the first `n` emissions from the source observable, then completes.
 * It completes in the same update as the `n`th emission, after passing that
 * value on. The initial value is passed on and not counted.
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
 * //  taken$  1     2     3|(completes)
 * //
 * //  Explanation:
 * //  - take emits only the first n values, completing with the nth
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
 * assert.isTrue(taken$.isCompleted);
 *
 * num$.next(4); // ignored (already completed)
 *
 * assert.deepStrictEqual(valueHistory, [1, 2, 3]);
 * ```
 */
export const take =
  <A,>(n: PositiveSafeIntWithSmallInt): DropInitialValueOperator<A, A> =>
  (parentObservable) =>
    new TakeObservableClass(parentObservable, n);

/* implementation */

class TakeObservableClass<A>
  extends SyncChildObservableClass<A, readonly [A]>
  implements TakeOperatorObservable<A>
{
  readonly #n: PositiveSafeIntWithSmallInt;
  #mut_count: number;

  constructor(parentObservable: Observable<A>, n: PositiveSafeIntWithSmallInt) {
    super({
      parents: [parentObservable],
      initialValue: parentObservable.getSnapshot(),
    });

    this.#mut_count = 0;

    this.#n = n;

    this.attach();
  }

  override tryUpdate(updateToken: UpdateToken): void {
    const par = this.parents[0];

    const sn = par.getSnapshot();

    if (
      this.#mut_count >= this.#n ||
      par.updateToken !== updateToken ||
      Optional.isNone(sn)
    ) {
      return; // skip update
    }

    this.#mut_count += 1;

    this.setNext(sn.value, updateToken);

    if (this.#mut_count >= this.#n) {
      this.completeAfterPropagation();
    }
  }
}

if (import.meta.vitest !== undefined) {
  test('type test', () => {
    expect(1).toBe(1); // dummy
  });

  {
    const s: Observable<number> = source<number>();

    const _d1 = s.pipe(take(3));

    expectType<typeof _d1, Observable<number>>('=');
  }

  {
    const s = source<number>();

    const m: InitializedObservable<number> = s.pipe(withInitialValue(0));

    const _d = m.pipe(take(3));

    expectType<typeof _d, Observable<number>>('=');
  }
}
