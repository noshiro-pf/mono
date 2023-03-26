import { Maybe } from '@noshiro/ts-utils';
import { SyncChildObservableClass } from '../class';
import {
  type InitializedToInitializedOperator,
  type MapOperatorObservable,
  type Observable,
  type ToBaseOperator,
  type UpdaterSymbol,
} from '../types';

export const map =
  <A, B>(mapFn: (x: A) => B): ToBaseOperator<A, B> =>
  (parentObservable: Observable<A>) =>
    new MapObservableClass(parentObservable, mapFn);

export const mapI = <A, B>(
  mapFn: (x: A) => B
): InitializedToInitializedOperator<A, B> =>
  map(mapFn) as InitializedToInitializedOperator<A, B>;

class MapObservableClass<A, B>
  extends SyncChildObservableClass<B, 'map', readonly [A]>
  implements MapOperatorObservable<A, B>
{
  readonly #mapFn: (x: A) => B;

  constructor(parentObservable: Observable<A>, mapFn: (x: A) => B) {
    super({
      parents: [parentObservable],
      type: 'map',
      currentValueInit: Maybe.map(parentObservable.currentValue, mapFn),
    });
    this.#mapFn = mapFn;
  }

  override tryUpdate(updaterSymbol: UpdaterSymbol): void {
    const par = this.parents[0];
    if (par.updaterSymbol !== updaterSymbol || Maybe.isNone(par.currentValue)) {
      return; // skip update
    }

    this.setNext(this.#mapFn(par.currentValue.value), updaterSymbol);
  }
}
