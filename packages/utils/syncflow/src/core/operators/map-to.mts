import { Maybe } from '@noshiro/ts-utils';
import { SyncChildObservableClass } from '../class/index.mjs';
import {
  type InitializedToInitializedOperator,
  type MapToOperatorObservable,
  type Observable,
  type ToUninitializedOperator,
  type UpdaterSymbol,
} from '../types/index.mjs';

export const mapTo =
  <A, B>(value: B): ToUninitializedOperator<A, B> =>
  (parentObservable: Observable<A>) =>
    new MapToObservableClass(parentObservable, value);

export const mapToI = <A, B>(
  value: B,
): InitializedToInitializedOperator<A, B> =>
  // eslint-disable-next-line total-functions/no-unsafe-type-assertion
  mapTo(value) as InitializedToInitializedOperator<A, B>;

class MapToObservableClass<A, B>
  extends SyncChildObservableClass<B, 'mapTo', readonly [A]>
  implements MapToOperatorObservable<A, B>
{
  readonly #value: B;

  constructor(parentObservable: Observable<A>, value: B) {
    super({
      parents: [parentObservable],
      type: 'mapTo',
      initialValue: Maybe.map(parentObservable.snapshot, () => value),
    });
    this.#value = value;
  }

  override tryUpdate(updaterSymbol: UpdaterSymbol): void {
    const par = this.parents[0];
    if (par.updaterSymbol !== updaterSymbol || Maybe.isNone(par.snapshot)) {
      return; // skip update
    }

    this.setNext(this.#value, updaterSymbol);
  }
}
