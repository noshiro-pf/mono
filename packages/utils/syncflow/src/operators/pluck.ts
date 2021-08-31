import { Option } from '@noshiro/ts-utils';
import { SyncChildObservableClass } from '../class';
import type {
  InitializedToInitializedOperator,
  Observable,
  PluckOperatorObservable,
  ToBaseOperator,
  Token,
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
  extends SyncChildObservableClass<A[K], 'pluck', [A]>
  implements PluckOperatorObservable<A, K>
{
  private readonly _key: K;

  constructor(parentObservable: Observable<A>, key: K) {
    super({
      parents: [parentObservable],
      type: 'pluck',
      currentValueInit: Option.map<A, A[K]>((x) => x[key])(
        parentObservable.currentValue
      ),
    });
    this._key = key;
  }

  override tryUpdate(token: Token): void {
    const par = this.parents[0];
    if (par.token !== token) return; // skip update
    if (Option.isNone(par.currentValue)) return; // skip update

    this.setNext(par.currentValue.value[this._key], token);
  }
}
