import { Maybe, SafeUint } from '@noshiro/ts-utils';
import { SyncChildObservableClass } from '../class';
import {
  type Observable,
  type RemoveInitializedOperator,
  type TakeOperatorObservable,
  type UpdaterSymbol,
} from '../types';
import { isPositiveSafeInteger } from '../utils';

export const take =
  <A>(
    n:
      | Exclude<SmallUint, 0>
      | IntersectBrand<NonZeroSafeIntBrand, SafeUintBrand>
  ): RemoveInitializedOperator<A, A> =>
  (parentObservable: Observable<A>) =>
    new TakeObservableClass(parentObservable, n);

class TakeObservableClass<A>
  extends SyncChildObservableClass<A, 'take', readonly [A]>
  implements TakeOperatorObservable<A>
{
  readonly #n: IntersectBrand<NonZeroSafeIntBrand, SafeUintBrand>;
  #mut_counter: SafeUint;

  constructor(
    parentObservable: Observable<A>,
    n:
      | Exclude<SmallUint, 0>
      | IntersectBrand<NonZeroSafeIntBrand, SafeUintBrand>
  ) {
    super({
      parents: [parentObservable],
      type: 'take',
      currentValueInit: !isPositiveSafeInteger(n)
        ? Maybe.none
        : parentObservable.currentValue,
    });
    this.#mut_counter = 0;
    this.#n = n as IntersectBrand<NonZeroSafeIntBrand, SafeUintBrand>;

    // complete immediately if n is not positive integer
    if (!isPositiveSafeInteger(n)) {
      this.complete();
    }
  }

  override tryUpdate(updaterSymbol: UpdaterSymbol): void {
    const par = this.parents[0];
    if (par.updaterSymbol !== updaterSymbol || Maybe.isNone(par.currentValue)) {
      return; // skip update
    }

    this.#mut_counter = SafeUint.add(1, this.#mut_counter);
    if (this.#mut_counter > this.#n) {
      this.complete();
    } else {
      this.setNext(par.currentValue.value, updaterSymbol);
    }
  }
}
