import { Option } from '@noshiro/ts-utils';
import { AsyncChildObservableClass } from '../class';
import type {
  Observable,
  RemoveInitializedOperator,
  Subscription,
  SwitchMapOperatorObservable,
  Token,
} from '../types';

export const switchMap =
  <A, B>(
    mapToObservable: (curr: A) => Observable<B>
  ): RemoveInitializedOperator<A, B> =>
  (parentObservable: Observable<A>) =>
    new SwitchMapObservableClass(parentObservable, mapToObservable);

class SwitchMapObservableClass<A, B>
  extends AsyncChildObservableClass<B, 'switchMap', readonly [A]>
  implements SwitchMapOperatorObservable<A, B>
{
  private readonly _mapToObservable: (curr: A) => Observable<B>;
  private _observable: Observable<B> | undefined;
  private _subscription: Subscription | undefined;

  constructor(
    parentObservable: Observable<A>,
    mapToObservable: (curr: A) => Observable<B>
  ) {
    super({
      parents: [parentObservable],
      type: 'switchMap',
      currentValueInit: Option.none,
    });
    this._mapToObservable = mapToObservable;
    this._observable = undefined;
    this._subscription = undefined;
  }

  override tryUpdate(token: Token): void {
    const par = this.parents[0];
    if (par.token !== token) return; // skip update
    if (Option.isNone(par.currentValue)) return; // skip update

    this._observable?.complete();
    this._subscription?.unsubscribe();

    const observable = this._mapToObservable(par.currentValue.value);
    this._observable = observable;

    const subscription = observable.subscribe((curr) => {
      this.startUpdate(curr);
    });
    this._subscription = subscription;
  }

  override complete(): void {
    this._subscription?.unsubscribe();
    this._observable?.complete();
    super.complete();
  }
}
