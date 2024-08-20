import { Maybe } from '@noshiro/ts-utils';
import { InitializedSyncChildObservableClass } from '../class/index.mjs';
import {
  type Observable,
  type ScanOperatorObservable,
  type SetInitialValueOperator,
  type UpdaterSymbol,
} from '../types/index.mjs';

export const scan =
  <A, B>(
    reducer: (acc: B, curr: A) => B,
    initialValue: B,
  ): SetInitialValueOperator<A, B> =>
  (parentObservable) =>
    new ScanObservableClass(parentObservable, reducer, initialValue);

class ScanObservableClass<A, B>
  extends InitializedSyncChildObservableClass<B, readonly [A]>
  implements ScanOperatorObservable<A, B>
{
  readonly #reducer: (acc: B, curr: A) => B;

  constructor(
    parentObservable: Observable<A>,
    reducer: (acc: B, curr: A) => B,
    initialValue: B,
  ) {
    super({
      parents: [parentObservable],
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
      updaterSymbol,
    );
  }
}
