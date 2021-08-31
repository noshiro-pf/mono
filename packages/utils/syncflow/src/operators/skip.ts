import { Option } from '@noshiro/ts-utils';
import { SyncChildObservableClass } from '../class';
import type {
  Observable,
  RemoveInitializedOperator,
  SkipOperatorObservable,
  Token,
} from '../types';
import { isPositiveInteger } from '../utils';

export const skip =
  <A>(n: number): RemoveInitializedOperator<A, A> =>
  (parentObservable: Observable<A>) =>
    !isPositiveInteger(n)
      ? parentObservable
      : new SkipObservableClass(parentObservable, n);

class SkipObservableClass<A>
  extends SyncChildObservableClass<A, 'skip', readonly [A]>
  implements SkipOperatorObservable<A>
{
  private readonly _n: number;
  private _counter: number;

  constructor(parentObservable: Observable<A>, n: number) {
    super({
      parents: [parentObservable],
      type: 'skip',
      currentValueInit: !isPositiveInteger(n)
        ? parentObservable.currentValue
        : Option.none,
    });
    this._counter = 0;
    this._n = n;
  }

  override tryUpdate(token: Token): void {
    const par = this.parents[0];
    if (par.token !== token) return; // skip update
    if (Option.isNone(par.currentValue)) return; // skip update

    this._counter += 1;
    if (this._counter > this._n) {
      this.setNext(par.currentValue.value, token);
    }
  }
}
