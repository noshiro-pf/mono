import {
  Maybe,
  SafeUint,
  castRemoveSmallInt,
  toSafeUint,
} from '@noshiro/ts-utils';
import { SyncChildObservableClass } from '../class/index.mjs';
import {
  type Observable,
  type RemoveInitializedOperator,
  type SkipOperatorObservable,
  type UpdaterSymbol,
} from '../types/index.mjs';
import { isPositiveSafeInteger } from '../utils/index.mjs';

export const skip =
  <A,>(n: PositiveSafeIntWithSmallInt): RemoveInitializedOperator<A, A> =>
  (parentObservable: Observable<A>) =>
    !isPositiveSafeInteger(n)
      ? parentObservable
      : new SkipObservableClass(parentObservable, n);

class SkipObservableClass<A>
  extends SyncChildObservableClass<A, 'skip', readonly [A]>
  implements SkipOperatorObservable<A>
{
  readonly #n: PositiveSafeInt;
  #counter: SafeUint;

  constructor(parentObservable: Observable<A>, n: PositiveSafeIntWithSmallInt) {
    super({
      parents: [parentObservable],
      type: 'skip',
      initialValue: !isPositiveSafeInteger(n)
        ? parentObservable.snapshot
        : Maybe.none,
    });
    this.#counter = toSafeUint(0);
    this.#n = castRemoveSmallInt(n);
  }

  override tryUpdate(updaterSymbol: UpdaterSymbol): void {
    const par = this.parents[0];
    if (par.updaterSymbol !== updaterSymbol || Maybe.isNone(par.snapshot)) {
      return; // skip update
    }

    this.#counter = SafeUint.add(1, this.#counter);
    if (this.#counter > this.#n) {
      this.setNext(par.snapshot.value, updaterSymbol);
    }
  }
}
