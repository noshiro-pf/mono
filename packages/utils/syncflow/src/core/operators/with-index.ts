import { Maybe } from '@noshiro/ts-utils';
import { SyncChildObservableClass } from '../class';
import type {
  InitializedToInitializedOperator,
  Observable,
  ToBaseOperator,
  Token,
  WithIndexOperatorObservable,
} from '../types';

export const withIndex =
  <A>(): ToBaseOperator<A, readonly [number, A]> =>
  (parentObservable: Observable<A>) =>
    new WithIndexObservableClass(parentObservable);

export const withIndexI = <A>(): InitializedToInitializedOperator<
  A,
  readonly [number, A]
> => withIndex() as InitializedToInitializedOperator<A, readonly [number, A]>;

export const attachIndex = withIndex; // alias
export const attachIndexI = withIndexI; // alias

class WithIndexObservableClass<A>
  extends SyncChildObservableClass<
    readonly [number, A],
    'withIndex',
    readonly [A]
  >
  implements WithIndexOperatorObservable<A>
{
  private _mut_index: number;

  constructor(parentObservable: Observable<A>) {
    super({
      parents: [parentObservable],
      type: 'withIndex',
      currentValueInit: Maybe.map<A, readonly [number, A]>((x) => [-1, x])(
        parentObservable.currentValue
      ),
    });
    this._mut_index = -1;
  }

  override tryUpdate(token: Token): void {
    const par = this.parents[0];
    if (par.token !== token) return; // skip update
    if (Maybe.isNone(par.currentValue)) return; // skip update

    this._mut_index += 1;
    this.setNext([this._mut_index, par.currentValue.value], token);
  }
}
