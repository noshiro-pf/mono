import { Optional, pipe } from 'ts-data-forge';
import { SyncChildObservableClass } from '../class/index.mjs';
import {
  type DropInitialValueOperator,
  type Observable,
  type UpdateToken,
  type WithCurrentValueFromOperatorObservable,
} from '../types/index.mjs';
import { maxDepth } from '../utils/index.mjs';

/**
 * Samples the current value from another observable each time the source emits.
 * Emits a tuple of [sourceValue, sampledValue].
 *
 * @template A - The type of values from the source observable
 * @template B - The type of values from the sampled observable
 * @param observable - The observable to sample from
 * @returns An operator that emits tuples of source and sampled values
 *
 * @example
 * ```ts
 * //  Timeline:
 * //
 * //  name$     "Alice"           "Bob"               "Charlie"
 * //  age$                25              30
 * //  result$   (skip)          ["Bob",25]           ["Charlie",30]
 * //
 * //  Explanation:
 * //  - withCurrentValueFrom samples the current value from another observable
 * //  - Emits a tuple [sourceValue, sampledValue] each time the SOURCE emits
 * //  - Does NOT emit when the sampled observable (age$) emits
 * //  - Does not emit until both observables have emitted at least once
 * //  - "Alice" is skipped because age$ hasn't emitted yet
 *
 * const name$ = source<string>();
 *
 * const age$ = source<number>();
 *
 * const result$ = name$.pipe(withCurrentValueFrom(age$));
 *
 * const valueHistory: (readonly [string, number])[] = [];
 *
 * result$.subscribe(([name_, currentAge]) => {
 *   valueHistory.push([name_, currentAge]);
 * });
 *
 * name$.next('Alice'); // nothing logged (age$ hasn't emitted)
 *
 * assert.deepStrictEqual(valueHistory, []);
 *
 * age$.next(25);
 *
 * name$.next('Bob'); // logs: Bob is 25 years old
 *
 * assert.deepStrictEqual(valueHistory, [['Bob', 25]]);
 *
 * age$.next(30);
 *
 * name$.next('Charlie'); // logs: Charlie is 30 years old
 *
 * assert.deepStrictEqual(valueHistory, [
 *   ['Bob', 25],
 *   ['Charlie', 30],
 * ]);
 * ```
 */
export const withCurrentValueFrom =
  <A, B>(
    observable: Observable<B>,
  ): DropInitialValueOperator<A, readonly [A, B]> =>
  (parentObservable) =>
    new WithCurrentValueFromObservableClass(parentObservable, observable);

/**
 * Alias for `withCurrentValueFrom`.
 * @see withCurrentValueFrom
 */
export const withLatestFrom = withCurrentValueFrom;

class WithCurrentValueFromObservableClass<A, B>
  extends SyncChildObservableClass<readonly [A, B], readonly [A]>
  implements WithCurrentValueFromOperatorObservable<A, B>
{
  readonly #observable: Observable<B>;

  constructor(parentObservable: Observable<A>, observable: Observable<B>) {
    super({
      parents: [parentObservable],
      depth: 1 + maxDepth([parentObservable, observable]),
      initialValue: pipe({
        par: parentObservable.getSnapshot(),
        me: observable.getSnapshot(),
      }).map(({ me, par }) =>
        Optional.isNone(par) || Optional.isNone(me)
          ? Optional.none
          : Optional.some([par.value, me.value] as const),
      ).value,
    });

    this.#observable = observable;
  }

  override tryUpdate(updateToken: UpdateToken): void {
    const par = this.parents[0];

    const ps = par.getSnapshot();

    if (par.updateToken !== updateToken || Optional.isNone(ps)) {
      return; // skip update
    }

    const curr = this.#observable.getSnapshot();

    if (Optional.isNone(curr)) return; // skip update

    this.setNext([ps.value, curr.value], updateToken);
  }
}
