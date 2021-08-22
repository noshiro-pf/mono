import { Option } from '@noshiro/ts-utils';
import { SyncChildObservableClass } from '../class';
import type {
  InitializedToInitializedOperator,
  Observable,
  ToBaseOperator,
  Token,
  WithIndexOperatorObservable,
} from '../types';

export const withIndex =
  <A>(): ToBaseOperator<A, [number, A]> =>
  (parentObservable: Observable<A>) =>
    new WithIndexObservableClass(parentObservable);

export const withIndexI = <A>(): InitializedToInitializedOperator<
  A,
  [number, A]
> => withIndex() as InitializedToInitializedOperator<A, [number, A]>;

export const attachIndex = withIndex; // alias
export const attachIndexI = withIndexI; // alias

class WithIndexObservableClass<A>
  extends SyncChildObservableClass<[number, A], 'withIndex', [A]>
  implements WithIndexOperatorObservable<A>
{
  private _index: number;

  constructor(parentObservable: Observable<A>) {
    super({
      parents: [parentObservable],
      type: 'withIndex',
      currentValueInit: Option.map<A, [number, A]>((x) => [-1, x])(
        parentObservable.currentValue
      ),
    });
    this._index = -1;
  }

  override tryUpdate(token: Token): void {
    const par = this.parents[0];
    if (par.token !== token) return; // skip update
    if (Option.isNone(par.currentValue)) return; // skip update

    this._index += 1;
    this.setNext([this._index, par.currentValue.value], token);
  }
}
