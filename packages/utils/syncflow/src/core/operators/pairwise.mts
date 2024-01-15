import { Maybe } from '@noshiro/ts-utils';
import { SyncChildObservableClass } from '../class/index.mjs';
import {
  type Observable,
  type PairwiseOperatorObservable,
  type RemoveInitializedOperator,
  type UpdaterSymbol,
} from '../types/index.mjs';

export const pairwise =
  <A,>(): RemoveInitializedOperator<A, readonly [A, A]> =>
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
    const cond = !Maybe.isNone(prev);

    // NOTE: setNext より先に更新しないと tryUpdate が連続して呼ばれたときに Maybe.isNone(prev) が true になり続けてしまう
    this.#previousValue = par.snapshot;

    if (cond) {
      this.setNext([prev.value, par.snapshot.value], updaterSymbol);
    }
  }
}
