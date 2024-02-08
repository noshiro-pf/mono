import { Arr, Maybe } from '@noshiro/ts-utils';
import { AsyncChildObservableClass } from '../class/index.mjs';
import {
  type MergeMapOperatorObservable,
  type Observable,
  type Subscription,
  type ToUninitializedOperator,
  type UpdaterSymbol,
} from '../types/index.mjs';

/**
 * @deprecated To improve the readability of your code, use `createState`
 *   instead of `mergeMap`, and subscribe to `parentObservable` and call
 *   `setState` within it.
 */
export const mergeMap =
  <A, B>(
    mapToObservable: (curr: A) => Observable<B>,
  ): ToUninitializedOperator<A, B> =>
  (parentObservable: Observable<A>) =>
    new MergeMapObservableClass(parentObservable, mapToObservable);

/**
 * @deprecated To improve the readability of your code, use `createState`
 *   instead of `mergeMap`, and subscribe to `parentObservable` and call
 *   `setState` within it.
 */
// eslint-disable-next-line deprecation/deprecation
export const flatMap = mergeMap;

class MergeMapObservableClass<A, B>
  extends AsyncChildObservableClass<B, 'mergeMap', readonly [A]>
  implements MergeMapOperatorObservable<A, B>
{
  readonly #mapToObservable: (curr: A) => Observable<B>;
  #observables: readonly Observable<B>[];
  #subscriptions: readonly Subscription[];

  constructor(
    parentObservable: Observable<A>,
    mapToObservable: (curr: A) => Observable<B>,
  ) {
    super({
      parents: [parentObservable],
      type: 'mergeMap',
      initialValue: Maybe.none,
    });
    this.#mapToObservable = mapToObservable;
    this.#observables = [];
    this.#subscriptions = [];
  }

  override tryUpdate(updaterSymbol: UpdaterSymbol): void {
    const par = this.parents[0];
    if (par.updaterSymbol !== updaterSymbol || Maybe.isNone(par.snapshot)) {
      return; // skip update
    }

    const observable = this.#mapToObservable(par.snapshot.value);
    this.#observables = Arr.pushed(this.#observables, observable);

    const subscription = observable.subscribe((curr) => {
      this.startUpdate(curr);
    });
    this.#subscriptions = Arr.pushed(this.#subscriptions, subscription);
  }

  override complete(): void {
    for (const s of this.#subscriptions) {
      s.unsubscribe();
    }
    for (const o of this.#observables) {
      o.complete();
    }
    super.complete();
  }
}
