import { Option } from '@noshiro/ts-utils';
import { InitializedSyncChildObservableClass } from '../class';
import type {
  Observable,
  ToInitializedOperator,
  Token,
  WithInitialValueOperatorObservable,
} from '../types';

export const withInitialValue =
  <A, I = A>(initialValue: I): ToInitializedOperator<A, A | I> =>
  (parentObservable: Observable<A>) =>
    new WithInitialValueObservableClass(parentObservable, initialValue);

class WithInitialValueObservableClass<A, I>
  extends InitializedSyncChildObservableClass<A | I, 'withInitialValue', [A]>
  implements WithInitialValueOperatorObservable<A, I>
{
  constructor(parentObservable: Observable<A>, initialValue: I) {
    super({
      parents: [parentObservable],
      type: 'withInitialValue',
      currentValueInit: Option.some(initialValue),
    });
  }

  override tryUpdate(token: Token): void {
    const par = this.parents[0];
    if (par.token !== token) return; // skip update
    if (Option.isNone(par.currentValue)) return; // skip update

    this.setNext(par.currentValue.value, token);
  }
}
