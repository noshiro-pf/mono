import { Maybe } from '@noshiro/ts-utils';
import { SyncChildObservableClass } from '../class';
import type {
  Observable,
  PairwiseOperatorObservable,
  RemoveInitializedOperator,
  Token,
} from '../types';

export const pairwise =
  <A>(): RemoveInitializedOperator<A, readonly [A, A]> =>
  (parentObservable: Observable<A>) =>
    new PairwiseObservableClass(parentObservable);

class PairwiseObservableClass<A>
  extends SyncChildObservableClass<readonly [A, A], 'pairwise', readonly [A]>
  implements PairwiseOperatorObservable<A>
{
  #previousValue: Maybe<A>;

  constructor(parentObservable: Observable<A>) {
    super({
      parents: [parentObservable],
      type: 'pairwise',
      currentValueInit: Maybe.none,
    });
    // parentObservable.currentValue has value
    // if parentObservable is InitializedObservable
    this.#previousValue = parentObservable.currentValue;
  }

  override tryUpdate(token: Token): void {
    const par = this.parents[0];

    if (par.token !== token) return; // skip update
    if (Maybe.isNone(par.currentValue)) return; // skip update

    const prev = this.#previousValue;

    if (!Maybe.isNone(prev)) {
      this.setNext([prev.value, par.currentValue.value], token);
    }

    this.#previousValue = par.currentValue;
  }
}
