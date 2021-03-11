import { Option } from '@noshiro/ts-utils';
import { AsyncChildObservableClass } from '../class';
import {
  MergeMapOperatorObservable,
  Observable,
  RemoveInitializedOperator,
  Subscription,
  Token,
} from '../types';

export const mergeMap = <A, B>(
  mapToObservable: (curr: A) => Observable<B>
): RemoveInitializedOperator<A, B> => (parent: Observable<A>) =>
  new MergeMapObservableClass(parent, mapToObservable);

export const flatMap = mergeMap;

class MergeMapObservableClass<A, B>
  extends AsyncChildObservableClass<B, 'mergeMap', [A]>
  implements MergeMapOperatorObservable<A, B> {
  private readonly _mapToObservable: (curr: A) => Observable<B>;
  private readonly _observables: Observable<B>[];
  private readonly _subscriptions: Subscription[];

  constructor(
    parent: Observable<A>,
    mapToObservable: (curr: A) => Observable<B>
  ) {
    super({
      parents: [parent],
      type: 'mergeMap',
      currentValueInit: Option.none,
    });
    this._mapToObservable = mapToObservable;
    this._observables = [];
    this._subscriptions = [];
  }

  tryUpdate(token: Token): void {
    const parent = this.parents[0];
    if (parent.token !== token) return; // skip update
    if (Option.isNone(parent.currentValue)) return; // skip update

    const observable = this._mapToObservable(parent.currentValue.value);
    this._observables.push(observable);

    const subscription = observable.subscribe((curr) => {
      this.startUpdate(curr);
    });
    this._subscriptions.push(subscription);
  }

  // overload
  complete(): void {
    this._observables.forEach((o) => {
      o.complete();
    });
    this._subscriptions.forEach((s) => {
      s.unsubscribe();
    });
  }
}
