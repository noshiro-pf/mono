import { Maybe } from '@noshiro/ts-utils';
import { SyncChildObservableClass } from '../class';
import type {
  Observable,
  RemoveInitializedOperator,
  TakeOperatorObservable,
  UpdaterSymbol,
} from '../types';
import { isPositiveInteger } from '../utils';

export const take =
  <A>(n: number): RemoveInitializedOperator<A, A> =>
  (parentObservable: Observable<A>) =>
    new TakeObservableClass(parentObservable, n);

class TakeObservableClass<A>
  extends SyncChildObservableClass<A, 'take', readonly [A]>
  implements TakeOperatorObservable<A>
{
  readonly #n: number;
  #mut_counter: number;

  constructor(parentObservable: Observable<A>, n: number) {
    super({
      parents: [parentObservable],
      type: 'take',
      currentValueInit: !isPositiveInteger(n)
        ? Maybe.none
        : parentObservable.currentValue,
    });
    this.#mut_counter = 0;
    this.#n = n;

    // complete immediately if n is not positive integer
    if (!isPositiveInteger(n)) {
      this.complete();
    }
  }

  override tryUpdate(updaterSymbol: UpdaterSymbol): void {
    const par = this.parents[0];
    if (par.updaterSymbol !== updaterSymbol || Maybe.isNone(par.currentValue)) {
      return; // skip update
    }

    this.#mut_counter += 1;
    if (this.#mut_counter > this.#n) {
      this.complete();
    } else {
      this.setNext(par.currentValue.value, updaterSymbol);
    }
  }
}
