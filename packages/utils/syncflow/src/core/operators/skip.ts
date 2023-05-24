import { Maybe, SafeUint } from '@noshiro/ts-utils';
import { SyncChildObservableClass } from '../class';
import {
  type Observable,
  type RemoveInitializedOperator,
  type SkipOperatorObservable,
  type UpdaterSymbol,
} from '../types';
import { isPositiveSafeInteger } from '../utils';

export const skip =
  <A>(
    n:
      | Exclude<SmallUint, 0>
      | IntersectBrand<NonZeroSafeIntBrand, SafeUintBrand>
  ): RemoveInitializedOperator<A, A> =>
  (parentObservable: Observable<A>) =>
    !isPositiveSafeInteger(n)
      ? parentObservable
      : new SkipObservableClass(parentObservable, n);

class SkipObservableClass<A>
  extends SyncChildObservableClass<A, 'skip', readonly [A]>
  implements SkipOperatorObservable<A>
{
  readonly #n: IntersectBrand<NonZeroSafeIntBrand, SafeUintBrand>;
  #counter: SafeUint;

  constructor(
    parentObservable: Observable<A>,
    n:
      | Exclude<SmallUint, 0>
      | IntersectBrand<NonZeroSafeIntBrand, SafeUintBrand>
  ) {
    super({
      parents: [parentObservable],
      type: 'skip',
      currentValueInit: !isPositiveSafeInteger(n)
        ? parentObservable.currentValue
        : Maybe.none,
    });
    this.#counter = 0;
    this.#n = n as IntersectBrand<NonZeroSafeIntBrand, SafeUintBrand>;
  }

  override tryUpdate(updaterSymbol: UpdaterSymbol): void {
    const par = this.parents[0];
    if (par.updaterSymbol !== updaterSymbol || Maybe.isNone(par.currentValue)) {
      return; // skip update
    }

    this.#counter = SafeUint.add(1, this.#counter);
    if (this.#counter > this.#n) {
      this.setNext(par.currentValue.value, updaterSymbol);
    }
  }
}
