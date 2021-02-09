import { Option } from '@mono/ts-utils';
import { AsyncChildObservableClass } from '../class';
import {
  Observable,
  Operator,
  Subscription,
  SwitchMapOperatorObservable,
  Token,
} from '../types';

export const switchMap = <A, B>(
  mapToObservable: (curr: A) => Observable<B>
): Operator<A, B> => (parent: Observable<A>) =>
  new SwitchMapObservableClass(parent, mapToObservable);

class SwitchMapObservableClass<A, B>
  extends AsyncChildObservableClass<B, 'switchMap', [A]>
  implements SwitchMapOperatorObservable<A, B> {
  private readonly _mapToObservable: (curr: A) => Observable<B>;
  private _observable: Observable<B> | undefined = undefined;
  private _subscription: Subscription | undefined = undefined;

  constructor(
    parent: Observable<A>,
    mapToObservable: (curr: A) => Observable<B>
  ) {
    super({
      parents: [parent],
      type: 'switchMap',
      currentValueInit: Option.none,
    });
    this._mapToObservable = mapToObservable;
  }

  tryUpdate(token: Token): void {
    const parent = this.parents[0];
    if (parent.token !== token) return; // skip update
    if (Option.isNone(parent.currentValue)) return; // skip update

    this._observable?.complete();
    this._subscription?.unsubscribe();

    this._observable = this._mapToObservable(parent.currentValue.value);
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
