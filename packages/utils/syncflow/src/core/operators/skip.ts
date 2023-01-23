import { Maybe } from '@noshiro/ts-utils';
import { SyncChildObservableClass } from '../class';
import {
  type Observable,
  type RemoveInitializedOperator,
  type SkipOperatorObservable,
  type UpdaterSymbol,
} from '../types';
import { isPositiveInteger } from '../utils';

export const skip =
  <A>(n: number): RemoveInitializedOperator<A, A> =>
  (parentObservable: Observable<A>) =>
    !isPositiveInteger(n)
      ? parentObservable
      : new SkipObservableClass(parentObservable, n);

class SkipObservableClass<A>
  extends SyncChildObservableClass<A, 'skip', readonly [A]>
  implements SkipOperatorObservable<A>
{
  readonly #n: number;
  #counter: number;

  constructor(parentObservable: Observable<A>, n: number) {
    super({
      parents: [parentObservable],
      type: 'skip',
      currentValueInit: !isPositiveInteger(n)
        ? parentObservable.currentValue
        : Maybe.none,
    });
    this.#counter = 0;
    this.#n = n;
  }

  override tryUpdate(updaterSymbol: UpdaterSymbol): void {
    const par = this.parents[0];
    if (par.updaterSymbol !== updaterSymbol || Maybe.isNone(par.currentValue)) {
      return; // skip update
    }

    this.#counter += 1;
    if (this.#counter > this.#n) {
      this.setNext(par.currentValue.value, updaterSymbol);
    }
  }
}
