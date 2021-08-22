import { Option } from '@noshiro/ts-utils';
import { SyncChildObservableClass } from '../class';
import type {
  Observable,
  RemoveInitializedOperator,
  TakeOperatorObservable,
  Token,
} from '../types';
import { isPositiveInteger } from '../utils';

export const take =
  <A>(n: number): RemoveInitializedOperator<A, A> =>
  (parentObservable: Observable<A>) =>
    new TakeObservableClass(parentObservable, n);

class TakeObservableClass<A>
  extends SyncChildObservableClass<A, 'take', [A]>
  implements TakeOperatorObservable<A>
{
  private readonly _n: number;
  private _counter: number;

  constructor(parentObservable: Observable<A>, n: number) {
    super({
      parents: [parentObservable],
      type: 'take',
      currentValueInit: !isPositiveInteger(n)
        ? Option.none
        : parentObservable.currentValue,
    });
    this._counter = 0;
    this._n = n;

    // complete immediately if n is not positive integer
    if (!isPositiveInteger(n)) {
      this.complete();
    }
  }

  override tryUpdate(token: Token): void {
    const par = this.parents[0];
    if (par.token !== token) return; // skip update
    if (Option.isNone(par.currentValue)) return; // skip update

    this._counter += 1;
    if (this._counter > this._n) {
      this.complete();
    } else {
      this.setNext(par.currentValue.value, token);
    }
  }
}
