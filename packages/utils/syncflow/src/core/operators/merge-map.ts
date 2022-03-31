import { IList, Maybe } from '@noshiro/ts-utils';
import { AsyncChildObservableClass } from '../class';
import type {
  MergeMapOperatorObservable,
  Observable,
  RemoveInitializedOperator,
  Subscription,
  Token,
} from '../types';

/** @deprecated use `createState` instead */
export const mergeMap =
  <A, B>(
    mapToObservable: (curr: A) => Observable<B>
  ): RemoveInitializedOperator<A, B> =>
  (parentObservable: Observable<A>) =>
    new MergeMapObservableClass(parentObservable, mapToObservable);

/** @deprecated use `createState` instead */
export const flatMap = mergeMap;

class MergeMapObservableClass<A, B>
  extends AsyncChildObservableClass<B, 'mergeMap', readonly [A]>
  implements MergeMapOperatorObservable<A, B>
{
  private readonly _mapToObservable: (curr: A) => Observable<B>;
  private _observables: readonly Observable<B>[];
  private _subscriptions: readonly Subscription[];

  constructor(
    parentObservable: Observable<A>,
    mapToObservable: (curr: A) => Observable<B>
  ) {
    super({
      parents: [parentObservable],
      type: 'mergeMap',
      currentValueInit: Maybe.none,
    });
    this._mapToObservable = mapToObservable;
    this._observables = [];
    this._subscriptions = [];
  }

  override tryUpdate(token: Token): void {
    const par = this.parents[0];
    if (par.token !== token) return; // skip update
    if (Maybe.isNone(par.currentValue)) return; // skip update

    const observable = this._mapToObservable(par.currentValue.value);
    this._observables = IList.push(this._observables, observable);

    const subscription = observable.subscribe((curr) => {
      this.startUpdate(curr);
    });
    this._subscriptions = IList.push(this._subscriptions, subscription);
  }

  override complete(): void {
    for (const s of this._subscriptions) {
      s.unsubscribe();
    }
    for (const o of this._observables) {
      o.complete();
    }
    super.complete();
  }
}
