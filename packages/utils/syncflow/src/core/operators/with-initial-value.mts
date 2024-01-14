import { Maybe } from '@noshiro/ts-utils';
import { InitializedSyncChildObservableClass } from '../class/index.mjs';
import {
  type Observable,
  type ToInitializedOperator,
  type UpdaterSymbol,
  type WithInitialValueOperatorObservable,
} from '../types/index.mjs';

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
      initialValue: Maybe.some(initialValue),
    });
  }

  override tryUpdate(updaterSymbol: UpdaterSymbol): void {
    const par = this.parents[0];
    if (par.updaterSymbol !== updaterSymbol || Maybe.isNone(par.snapshot)) {
      return; // skip update
    }

    this.setNext(par.snapshot.value, updaterSymbol);
  }
}
