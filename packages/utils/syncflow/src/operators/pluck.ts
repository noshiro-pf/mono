import { Option } from '@noshiro/ts-utils';
import { SyncChildObservableClass } from '../class';
import {
  InitializedToInitializedOperator,
  Observable,
  PluckOperatorObservable,
  ToBaseOperator,
  Token,
} from '../types';

export const pluck = <A, K extends keyof A>(
  key: K
): ToBaseOperator<A, A[K]> => (parent: Observable<A>) =>
  new PluckObservableClass(parent, key);

export const pluckI = <A, K extends keyof A>(
  key: K
): InitializedToInitializedOperator<A, A[K]> =>
  pluck(key) as InitializedToInitializedOperator<A, A[K]>;

class PluckObservableClass<A, K extends keyof A>
  extends SyncChildObservableClass<A[K], 'pluck', [A]>
  implements PluckOperatorObservable<A, K> {
  private readonly _key: K;

  constructor(parent: Observable<A>, key: K) {
    super({
      parents: [parent],
      type: 'pluck',
      currentValueInit: Option.map<A, A[K]>((x) => x[key])(parent.currentValue),
    });
    this._key = key;
  }

  tryUpdate(token: Token): void {
    const parent = this.parents[0];
    if (parent.token !== token) return; // skip update
    if (Option.isNone(parent.currentValue)) return; // skip update

    this.setNext(parent.currentValue.value[this._key], token);
  }
}
