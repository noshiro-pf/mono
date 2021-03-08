import { Option } from '@noshiro/ts-utils';
import { SyncChildObservableClass } from '../class';
import { Observable, Operator, TakeOperatorObservable, Token } from '../types';

export const take = <A>(n: number): Operator<A, A> => (parent: Observable<A>) =>
  new TakeObservableClass(parent, n);

class TakeObservableClass<A>
  extends SyncChildObservableClass<A, 'take', [A]>
  implements TakeOperatorObservable<A> {
  private readonly _n: number;
  private _counter: number = 0;

  constructor(parent: Observable<A>, n: number) {
    super({
      parents: [parent],
      type: 'take',
      currentValueInit: Option.none,
    });
    this._n = n;
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
