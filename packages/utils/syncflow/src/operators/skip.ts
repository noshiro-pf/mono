import { Option } from '@noshiro/ts-utils';
import { SyncChildObservableClass } from '../class';
import { Observable, Operator, SkipOperatorObservable, Token } from '../types';

export const skip = <A>(n: number): Operator<A, A> => (parent: Observable<A>) =>
  new SkipObservableClass(parent, n);

class SkipObservableClass<A>
  extends SyncChildObservableClass<A, 'skip', [A]>
  implements SkipOperatorObservable<A> {
  private readonly _n: number;
  private _counter: number;

  constructor(parent: Observable<A>, n: number) {
    super({
      parents: [parent],
      type: 'skip',
      currentValueInit: n === 0 ? parent.currentValue : Option.none,
    });
    this._counter = 0;
    this._n = n;
  }

  tryUpdate(token: Token): void {
    const parent = this.parents[0];
    if (parent.token !== token) return; // skip update
    if (Option.isNone(parent.currentValue)) return; // skip update

    this._counter += 1;
    if (this._counter > this._n) {
      this.setNext(parent.currentValue.value, token);
    }
  }
}
