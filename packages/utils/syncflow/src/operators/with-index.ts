import { Option } from '@noshiro/ts-utils';
import { SyncChildObservableClass } from '../class';
import {
  Observable,
  Operator,
  Token,
  WithIndexOperatorObservable,
} from '../types';

export const withIndex = <A>(): Operator<A, [number, A]> => (
  parent: Observable<A>
) => new WithIndexObservableClass(parent);

export const attachIndex = withIndex;

class WithIndexObservableClass<A>
  extends SyncChildObservableClass<[number, A], 'withIndex', [A]>
  implements WithIndexOperatorObservable<A> {
  private _index: number;

  constructor(parent: Observable<A>) {
    super({
      parents: [parent],
      type: 'withIndex',
      currentValueInit: Option.map<A, [number, A]>((x) => [-1, x])(
        parent.currentValue
      ),
    });
    this._index = -1;
  }

  tryUpdate(token: Token): void {
    const parent = this.parents[0];
    if (parent.token !== token) return; // skip update
    if (Option.isNone(parent.currentValue)) return; // skip update

    this._index += 1;
    this.setNext([this._index, parent.currentValue.value], token);
  }
}
