import { Maybe } from '@noshiro/ts-utils';
import { InitializedSyncChildObservableClass } from '../class';
import type {
  Observable,
  ScanOperatorObservable,
  ToInitializedOperator,
  UpdaterSymbol,
} from '../types';

export const scan =
  <A, B>(
    reducer: (acc: B, curr: A) => B,
    initialValue: B
  ): ToInitializedOperator<A, B> =>
  (parentObservable: Observable<A>) =>
    new ScanObservableClass(parentObservable, reducer, initialValue);

class ScanObservableClass<A, B>
  extends InitializedSyncChildObservableClass<B, 'scan', readonly [A]>
  implements ScanOperatorObservable<A, B>
{
  readonly #reducer: (acc: B, curr: A) => B;

  constructor(
    parentObservable: Observable<A>,
    reducer: (acc: B, curr: A) => B,
    initialValue: B
  ) {
    super({
      parents: [parentObservable],
      type: 'scan',
      currentValueInit: Maybe.some(initialValue),
    });
    this.#reducer = reducer;
  }

  override tryUpdate(updaterSymbol: UpdaterSymbol): void {
    const par = this.parents[0];
    if (
      par.updaterSymbol !== updaterSymbol ||
      Maybe.isNone(par.currentValue) ||
      Maybe.isNone(this.currentValue)
    ) {
      return; // skip update
    }

    this.setNext(
      this.#reducer(this.currentValue.value, par.currentValue.value),
      updaterSymbol
    );
  }
}
