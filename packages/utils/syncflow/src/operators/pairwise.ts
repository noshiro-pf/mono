import { Option } from '@noshiro/ts-utils';
import { SyncChildObservableClass } from '../class';
import {
  Observable,
  PairwiseOperatorObservable,
  RemoveInitializedOperator,
  Token,
} from '../types';

export const pairwise = <A>(): RemoveInitializedOperator<A, [A, A]> => (
  parent: Observable<A>
) => new PairwiseObservableClass(parent);

class PairwiseObservableClass<A>
  extends SyncChildObservableClass<[A, A], 'pairwise', [A]>
  implements PairwiseOperatorObservable<A> {
  private _previousValue: Option<A> = Option.none;
  constructor(parent: Observable<A>) {
    super({
      parents: [parent],
      type: 'pairwise',
      currentValueInit: Option.none,
    });
  }

  tryUpdate(token: Token): void {
    const parent = this.parents[0];
    if (parent.token !== token) return; // skip update
    if (Option.isNone(parent.currentValue)) return; // skip update

    const prev = this._previousValue;
    this._previousValue = parent.currentValue;

    if (Option.isNone(prev)) return; // skip update

    this.setNext([prev.value, parent.currentValue.value], token);
  }
}
