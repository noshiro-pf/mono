import { Option } from '@noshiro/ts-utils';
import { AsyncChildObservableClass } from '../class';
import type {
  Observable,
  RemoveInitializedOperator,
  Subscription,
  SwitchMapOperatorObservable,
  Token,
} from '../types';

export const switchMap = <A, B>(
  mapToObservable: (curr: A) => Observable<B>
): RemoveInitializedOperator<A, B> => (parentObservable: Observable<A>) =>
  new SwitchMapObservableClass(parentObservable, mapToObservable);

class SwitchMapObservableClass<A, B>
  extends AsyncChildObservableClass<B, 'switchMap', [A]>
  implements SwitchMapOperatorObservable<A, B> {
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
    this._observable = undefined;
    this._subscription = undefined;
    this._mapToObservable = mapToObservable;
  }

  tryUpdate(token: Token): void {
    const par = this.parents[0];
    if (par.token !== token) return; // skip update
    if (Option.isNone(par.currentValue)) return; // skip update

    this._observable?.complete();
    this._subscription?.unsubscribe();

    this._observable = this._mapToObservable(par.currentValue.value);
    this._subscription = this._observable.subscribe((curr) => {
      this.startUpdate(curr);
    });
  }

  // overload
  complete(): void {
    this._observable?.complete();
    this._subscription?.unsubscribe();
  }
}
