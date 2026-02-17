import { Arr, Optional } from 'ts-data-forge';
import { AsyncChildObservableClass } from '../class/index.mjs';
import {
  type DropInitialValueOperator,
  type MergeMapOperatorObservable,
  type Observable,
  type Subscription,
  type UpdaterSymbol,
} from '../types/index.mjs';

/**
 * Projects each source value to an observable and merges all inner observables.
 * Unlike `switchMap`, does not cancel previous inner observables.
 *
 * @template A - The type of values from the source
 * @template B - The type of values from the projected observable
 * @param mapToObservable - A function that maps each source value to an observable
 * @returns An operator that merges mapped observables
 *
 * @example
 * ```ts
 * const ids$ = source<number>();
 *
 * const users$ = ids$.pipe(mergeMap((id) => fromPromise(fetchUser(id))));
 *
 * users$.subscribe((user) => {
 *   console.log(user);
 * });
 * // All requests run in parallel, results merged as they arrive
 *
 * const fetchUser = async (id: number): Promise<unknown> => ({ id });
 * ```
 *
 * @note To improve code readability, consider using `createState` instead of `mergeMap`,
 * subscribing to `parentObservable` and calling `setState` within it.
 */
export const mergeMap =
  <A, B>(
    mapToObservable: (curr: A) => Observable<B>,
  ): DropInitialValueOperator<A, B> =>
  (parentObservable) =>
    new MergeMapObservableClass(parentObservable, mapToObservable);

/**
 * Alias for `mergeMap()`.
 * @see mergeMap
 */
export const flatMap = mergeMap;

class MergeMapObservableClass<A, B>
  extends AsyncChildObservableClass<B, readonly [A]>
  implements MergeMapOperatorObservable<A, B>
{
  readonly #mapToObservable: (curr: A) => Observable<B>;
  #mut_observables: readonly Observable<B>[];
  #mut_subscriptions: readonly Subscription[];

  constructor(
    parentObservable: Observable<A>,
    mapToObservable: (curr: A) => Observable<B>,
  ) {
    super({
      parents: [parentObservable],
      initialValue: Optional.none,
    });

    this.#mapToObservable = mapToObservable;

    this.#mut_observables = [];

    this.#mut_subscriptions = [];
  }

  override tryUpdate(updaterSymbol: UpdaterSymbol): void {
    const par = this.parents[0];

    const sn = par.getSnapshot();

    if (par.updaterSymbol !== updaterSymbol || Optional.isNone(sn)) {
      return; // skip update
    }

    const observable = this.#mapToObservable(sn.value);

    this.#mut_observables = Arr.toPushed(this.#mut_observables, observable);

    const subscription = observable.subscribe((curr) => {
      this.startUpdate(curr);
    });

    this.#mut_subscriptions = Arr.toPushed(
      this.#mut_subscriptions,
      subscription,
    );
  }

  override complete(): void {
    for (const s of this.#mut_subscriptions) {
      s.unsubscribe();
    }

    for (const o of this.#mut_observables) {
      o.complete();
    }

    super.complete();
  }
}
