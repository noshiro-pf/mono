import { Optional, pipe } from 'ts-data-forge';
import { SyncChildObservableClass } from '../class/index.mjs';
import {
  type DropInitialValueOperator,
  type Observable,
  type UpdaterSymbol,
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
 * //  age$                25              30      35              40
 * //  result$             ["Alice",25]  ["Bob",30]  ["Bob",35]  ["Charlie",40]
 * //
 * //  Explanation:
 * //  - withCurrentValueFrom samples the current value from another observable
 * //  - Emits a tuple [sourceValue, sampledValue] each time the source emits
 * //  - Does not emit until both observables have emitted at least once
 * //  - Similar to combine, but only emits when the source (not the sampled) emits
 *
 * const name$ = source<string>();
 *
 * const age$ = source<number>();
 *
 * const result$ = name$.pipe(withCurrentValueFrom(age$));
 *
 * const mut_history: (readonly [string, number])[] = [];
 *
 * result$.subscribe(([name_, currentAge]) => {
 *   mut_history.push([name_, currentAge]);
 * });
 *
 * name$.next('Alice'); // nothing logged (age$ hasn't emitted)
 *
 * assert.deepStrictEqual(mut_history, []);
 *
 * age$.next(25);
 *
 * name$.next('Bob'); // logs: Bob is 25 years old
 *
 * assert.deepStrictEqual(mut_history, [['Bob', 25]]);
 *
 * age$.next(30);
 *
 * name$.next('Charlie'); // logs: Charlie is 30 years old
 *
 * assert.deepStrictEqual(mut_history, [
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

  override tryUpdate(updaterSymbol: UpdaterSymbol): void {
    const par = this.parents[0];

    const ps = par.getSnapshot();

    if (par.updaterSymbol !== updaterSymbol || Optional.isNone(ps)) {
      return; // skip update
    }

    const curr = this.#observable.getSnapshot();

    if (Optional.isNone(curr)) return; // skip update

    this.setNext([ps.value, curr.value], updaterSymbol);
  }
}
