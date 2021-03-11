import { Option } from '@noshiro/ts-utils';
import { SyncChildObservableClass } from '../class';
import {
  Observable,
  RemoveInitializedOperator,
  TakeOperatorObservable,
  Token,
} from '../types';
import { isPositiveInteger } from '../utils';

export const take = <A>(n: number): RemoveInitializedOperator<A, A> => (
  parent: Observable<A>
) => new TakeObservableClass(parent, n);

class TakeObservableClass<A>
  extends SyncChildObservableClass<A, 'take', [A]>
  implements TakeOperatorObservable<A> {
  private readonly _n: number;
  private _counter: number;

  constructor(parent: Observable<A>, n: number) {
    super({
      parents: [parent],
      type: 'take',
      currentValueInit: !isPositiveInteger(n)
        ? Option.none
        : parent.currentValue,
    });
    this._counter = 0;
    this._n = n;

    // complete immediately if n is not positive integer
    if (!isPositiveInteger(n)) {
      this.complete();
    }
  }

  tryUpdate(token: Token): void {
    const parent = this.parents[0];
    if (parent.token !== token) return; // skip update
    if (Option.isNone(parent.currentValue)) return; // skip update

    this._counter += 1;
    if (this._counter > this._n) {
      this.complete();
    } else {
      this.setNext(parent.currentValue.value, token);
    }
  }
}
