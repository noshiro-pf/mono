import { Maybe } from '@noshiro/ts-utils';
import { SyncChildObservableClass } from '../class';
import {
  type Observable,
  type PairwiseOperatorObservable,
  type RemoveInitializedOperator,
  type UpdaterSymbol,
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
      initialValue: Maybe.none,
    });
    // parentObservable.snapshot has value
    // if parentObservable is InitializedObservable
    this.#previousValue = parentObservable.snapshot;
  }

  override tryUpdate(updaterSymbol: UpdaterSymbol): void {
    const par = this.parents[0];

    if (par.updaterSymbol !== updaterSymbol || Maybe.isNone(par.snapshot)) {
      return; // skip update
    }

    const prev = this.#previousValue;

    if (!Maybe.isNone(prev)) {
      this.setNext([prev.value, par.snapshot.value], updaterSymbol);
    }

    this.#previousValue = par.snapshot;
  }
}
