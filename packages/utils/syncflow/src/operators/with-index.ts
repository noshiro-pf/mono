import { Option } from '@noshiro/ts-utils';
import { SyncChildObservableClass } from '../class';
import {
  InitializedToInitializedOperator,
  Observable,
  ToBaseOperator,
  Token,
  WithIndexOperatorObservable,
} from '../types';

export const withIndex = <A>(): ToBaseOperator<A, [number, A]> => (
  parent: Observable<A>
) => new WithIndexObservableClass(parent);

export const withIndexI = <A>(): InitializedToInitializedOperator<
  A,
  [number, A]
> => withIndex() as InitializedToInitializedOperator<A, [number, A]>;

export const attachIndex = withIndex; // alias
export const attachIndexI = withIndexI; // alias

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
