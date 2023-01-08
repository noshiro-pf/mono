import { Arr, Maybe } from '@noshiro/ts-utils';
import { AsyncChildObservableClass } from '../class';
import type {
  MergeMapOperatorObservable,
  Observable,
  RemoveInitializedOperator,
  Subscription,
  UpdaterSymbol,
} from '../types';

/** @deprecated use `createState` instead */
export const mergeMap =
  <A, B>(
    mapToObservable: (curr: A) => Observable<B>
  ): RemoveInitializedOperator<A, B> =>
  (parentObservable: Observable<A>) =>
    new MergeMapObservableClass(parentObservable, mapToObservable);

/** @deprecated use `createState` instead */
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
    mapToObservable: (curr: A) => Observable<B>
  ) {
    super({
      parents: [parentObservable],
      type: 'mergeMap',
      currentValueInit: Maybe.none,
    });
    this.#mapToObservable = mapToObservable;
    this.#observables = [];
    this.#subscriptions = [];
  }

  override tryUpdate(updaterSymbol: UpdaterSymbol): void {
    const par = this.parents[0];
    if (par.updaterSymbol !== updaterSymbol || Maybe.isNone(par.currentValue)) {
      return; // skip update
    }

    const observable = this.#mapToObservable(par.currentValue.value);
    this.#observables = Arr.push(this.#observables, observable);

    const subscription = observable.subscribe((curr) => {
      this.startUpdate(curr);
    });
    this.#subscriptions = Arr.push(this.#subscriptions, subscription);
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
