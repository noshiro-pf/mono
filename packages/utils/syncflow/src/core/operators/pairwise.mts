import { Maybe } from '@noshiro/ts-utils';
import { SyncChildObservableClass } from '../class/index.mjs';
import {
  type DropInitialValueOperator,
  type Observable,
  type PairwiseOperatorObservable,
  type UpdaterSymbol,
} from '../types/index.mjs';

export const pairwise = <A,>(): DropInitialValueOperator<A, readonly [A, A]> =>
  f;

const f = <A,>(parentObservable: Observable<A>): Observable<readonly [A, A]> =>
  new PairwiseObservableClass(parentObservable);

class PairwiseObservableClass<A>
  extends SyncChildObservableClass<readonly [A, A], readonly [A]>
  implements PairwiseOperatorObservable<A>
{
  #previousValue: Maybe<A>;

  constructor(parentObservable: Observable<A>) {
    super({
      parents: [parentObservable],
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
