import { Maybe } from '@noshiro/ts-utils';
import { InitializedSyncChildObservableClass } from '../class';
import type {
  Observable,
  ToInitializedOperator,
  UpdaterSymbol,
  WithInitialValueOperatorObservable,
} from '../types';

export const withInitialValue =
  <A, I = A>(initialValue: I): ToInitializedOperator<A, A | I> =>
  (parentObservable: Observable<A>) =>
    new WithInitialValueObservableClass(parentObservable, initialValue);

class WithInitialValueObservableClass<A, I>
  extends InitializedSyncChildObservableClass<
    A | I,
    'withInitialValue',
    readonly [A]
  >
  implements WithInitialValueOperatorObservable<A, I>
{
  constructor(parentObservable: Observable<A>, initialValue: I) {
    super({
      parents: [parentObservable],
      type: 'withInitialValue',
      currentValueInit: Maybe.some(initialValue),
    });
  }

  override tryUpdate(updaterSymbol: UpdaterSymbol): void {
    const par = this.parents[0];
    if (par.updaterSymbol !== updaterSymbol || Maybe.isNone(par.currentValue)) {
      return; // skip update
    }

    this.setNext(par.currentValue.value, updaterSymbol);
  }
}
