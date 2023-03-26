import { Maybe } from '@noshiro/ts-utils';
import { SyncChildObservableClass } from '../class';
import {
  type InitializedToInitializedOperator,
  type Observable,
  type PluckOperatorObservable,
  type ToBaseOperator,
  type UpdaterSymbol,
} from '../types';

export const pluck =
  <A, K extends keyof A>(key: K): ToBaseOperator<A, A[K]> =>
  (parentObservable: Observable<A>) =>
    new PluckObservableClass(parentObservable, key);

export const pluckI = <A, K extends keyof A>(
  key: K
): InitializedToInitializedOperator<A, A[K]> =>
  pluck(key) as InitializedToInitializedOperator<A, A[K]>;

class PluckObservableClass<A, K extends keyof A>
  extends SyncChildObservableClass<A[K], 'pluck', readonly [A]>
  implements PluckOperatorObservable<A, K>
{
  readonly #key: K;

  constructor(parentObservable: Observable<A>, key: K) {
    super({
      parents: [parentObservable],
      type: 'pluck',
      currentValueInit: Maybe.map(parentObservable.currentValue, (x) => x[key]),
    });
    this.#key = key;
  }

  override tryUpdate(updaterSymbol: UpdaterSymbol): void {
    const par = this.parents[0];
    if (par.updaterSymbol !== updaterSymbol || Maybe.isNone(par.currentValue)) {
      return; // skip update
    }

    this.setNext(par.currentValue.value[this.#key], updaterSymbol);
  }
}
