import { Maybe } from '@noshiro/ts-utils';
import { SyncChildObservableClass } from '../class';
import {
  type InitializedToInitializedOperator,
  type MapWithIndexOperatorObservable,
  type Observable,
  type ToBaseOperator,
  type UpdaterSymbol,
} from '../types';

export const mapWithIndex =
  <A, B>(mapFn: (x: A, index: number) => B): ToBaseOperator<A, B> =>
  (parentObservable: Observable<A>) =>
    new MapWithIndexObservableClass(parentObservable, mapFn);

export const mapWithIndexI = <A, B>(
  mapFn: (x: A, index: number) => B
): InitializedToInitializedOperator<A, B> =>
  mapWithIndex(mapFn) as InitializedToInitializedOperator<A, B>;

class MapWithIndexObservableClass<A, B>
  extends SyncChildObservableClass<B, 'mapWithIndex', readonly [A]>
  implements MapWithIndexOperatorObservable<A, B>
{
  readonly #mapFn: (x: A, index: number) => B;
  #index: number;

  constructor(
    parentObservable: Observable<A>,
    mapFn: (x: A, index: number) => B
  ) {
    super({
      parents: [parentObservable],
      type: 'mapWithIndex',
      currentValueInit: Maybe.map(parentObservable.currentValue, (x) =>
        mapFn(x, -1)
      ),
    });
    this.#index = -1;
    this.#mapFn = mapFn;
  }

  override tryUpdate(updaterSymbol: UpdaterSymbol): void {
    const par = this.parents[0];
    if (par.updaterSymbol !== updaterSymbol || Maybe.isNone(par.currentValue)) {
      return; // skip update
    }

    this.#index += 1;
    this.setNext(
      this.#mapFn(par.currentValue.value, this.#index),
      updaterSymbol
    );
  }
}
