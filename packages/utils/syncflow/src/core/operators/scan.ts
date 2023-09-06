import { Maybe } from '@noshiro/ts-utils';
import { InitializedSyncChildObservableClass } from '../class';
import {
  type Observable,
  type ScanOperatorObservable,
  type ToInitializedOperator,
  type UpdaterSymbol,
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
      initialValue: Maybe.some(initialValue),
    });
    this.#reducer = reducer;
  }

  override tryUpdate(updaterSymbol: UpdaterSymbol): void {
    const par = this.parents[0];
    if (
      par.updaterSymbol !== updaterSymbol ||
      Maybe.isNone(par.snapshot) ||
      Maybe.isNone(this.snapshot)
    ) {
      return; // skip update
    }

    this.setNext(
      this.#reducer(this.snapshot.value, par.snapshot.value),
      updaterSymbol
    );
  }
}
