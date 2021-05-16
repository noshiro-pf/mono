import { Option } from '@noshiro/ts-utils';
import { AsyncChildObservableClass } from '../class';
import type {
  MergeMapOperatorObservable,
  Observable,
  RemoveInitializedOperator,
  Subscription,
  Token,
} from '../types';

export const mergeMap = <A, B>(
  mapToObservable: (curr: A) => Observable<B>
): RemoveInitializedOperator<A, B> => (parentObservable: Observable<A>) =>
  new MergeMapObservableClass(parentObservable, mapToObservable);

export const flatMap = mergeMap;

class MergeMapObservableClass<A, B>
  extends AsyncChildObservableClass<B, 'mergeMap', [A]>
  implements MergeMapOperatorObservable<A, B> {
  private readonly _mapToObservable: (curr: A) => Observable<B>;
  private readonly _observables: Observable<B>[];
  private readonly _subscriptions: Subscription[];

  constructor(
    parentObservable: Observable<A>,
    mapToObservable: (curr: A) => Observable<B>
  ) {
    super({
      parents: [parentObservable],
      type: 'mergeMap',
      currentValueInit: Option.none,
    });
    this._mapToObservable = mapToObservable;
    this._observables = [];
    this._subscriptions = [];
  }

  tryUpdate(token: Token): void {
    const par = this.parents[0];
    if (par.token !== token) return; // skip update
    if (Option.isNone(par.currentValue)) return; // skip update

    const observable = this._mapToObservable(par.currentValue.value);
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
