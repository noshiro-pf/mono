import { Option } from '@noshiro/ts-utils';
import { SyncChildObservableClass } from '../class';
import type {
  Observable,
  PairwiseOperatorObservable,
  RemoveInitializedOperator,
  Token,
} from '../types';

export const pairwise = <A>(): RemoveInitializedOperator<A, [A, A]> => (
  parentObservable: Observable<A>
) => new PairwiseObservableClass(parentObservable);

class PairwiseObservableClass<A>
  extends SyncChildObservableClass<[A, A], 'pairwise', [A]>
  implements PairwiseOperatorObservable<A> {
  private _previousValue: Option<A> = Option.none;
  constructor(parentObservable: Observable<A>) {
    super({
      parents: [parentObservable],
      type: 'pairwise',
      currentValueInit: Option.none,
    });
  }

  tryUpdate(token: Token): void {
    const par = this.parents[0];
    if (par.token !== token) return; // skip update
    if (Option.isNone(par.currentValue)) return; // skip update

    const prev = this._previousValue;
    this._previousValue = par.currentValue;

    if (Option.isNone(prev)) return; // skip update

    this.setNext([prev.value, par.currentValue.value], token);
  }
}
