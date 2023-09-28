import { Maybe, SafeUint, toSafeUint } from '@noshiro/ts-utils';
import { SyncChildObservableClass } from '../class';
import {
  type Observable,
  type RemoveInitializedOperator,
  type TakeOperatorObservable,
  type UpdaterSymbol,
} from '../types';
import { isPositiveSafeInteger } from '../utils';

export const take =
  <A>(n: PositiveSafeIntWithSmallInt): RemoveInitializedOperator<A, A> =>
  (parentObservable: Observable<A>) =>
    new TakeObservableClass(parentObservable, n);

class TakeObservableClass<A>
  extends SyncChildObservableClass<A, 'take', readonly [A]>
  implements TakeOperatorObservable<A>
{
  readonly #n: PositiveSafeInt;
  #mut_counter: SafeUint;

  constructor(parentObservable: Observable<A>, n: PositiveSafeIntWithSmallInt) {
    super({
      parents: [parentObservable],
      type: 'take',
      initialValue: !isPositiveSafeInteger(n)
        ? Maybe.none
        : parentObservable.snapshot,
    });
    this.#mut_counter = toSafeUint(0);
    this.#n = n as PositiveSafeInt;

    // complete immediately if n is not positive integer
    if (!isPositiveSafeInteger(n)) {
      this.complete();
    }
  }

  override tryUpdate(updaterSymbol: UpdaterSymbol): void {
    const par = this.parents[0];
    if (par.updaterSymbol !== updaterSymbol || Maybe.isNone(par.snapshot)) {
      return; // skip update
    }

    this.#mut_counter = SafeUint.add(1, this.#mut_counter);
    if (this.#mut_counter > this.#n) {
      this.complete();
    } else {
      this.setNext(par.snapshot.value, updaterSymbol);
    }
  }
}
