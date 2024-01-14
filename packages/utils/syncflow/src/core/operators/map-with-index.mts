import { Maybe, SafeUint, toSafeUint } from '@noshiro/ts-utils';
import { SyncChildObservableClass } from '../class/index.mjs';
import {
  type InitializedToInitializedOperator,
  type MapWithIndexOperatorObservable,
  type Observable,
  type ToBaseOperator,
  type UpdaterSymbol,
} from '../types/index.mjs';

export const mapWithIndex =
  <A, B>(mapFn: (x: A, index: SafeUint | -1) => B): ToBaseOperator<A, B> =>
  (parentObservable: Observable<A>) =>
    new MapWithIndexObservableClass(parentObservable, mapFn);

export const mapWithIndexI = <A, B>(
  mapFn: (x: A, index: SafeUint | -1) => B,
): InitializedToInitializedOperator<A, B> =>
  // eslint-disable-next-line no-restricted-syntax
  mapWithIndex(mapFn) as InitializedToInitializedOperator<A, B>;

class MapWithIndexObservableClass<A, B>
  extends SyncChildObservableClass<B, 'mapWithIndex', readonly [A]>
  implements MapWithIndexOperatorObservable<A, B>
{
  readonly #mapFn: (x: A, index: SafeUint | -1) => B;
  #index: SafeUint | -1;

  constructor(
    parentObservable: Observable<A>,
    mapFn: (x: A, index: SafeUint | -1) => B,
  ) {
    super({
      parents: [parentObservable],
      type: 'mapWithIndex',
      initialValue: Maybe.map(parentObservable.snapshot, (x) => mapFn(x, -1)),
    });
    this.#index = -1;
    this.#mapFn = mapFn;
  }

  override tryUpdate(updaterSymbol: UpdaterSymbol): void {
    const par = this.parents[0];
    if (par.updaterSymbol !== updaterSymbol || Maybe.isNone(par.snapshot)) {
      return; // skip update
    }

    this.#index =
      this.#index === -1 ? toSafeUint(0) : SafeUint.add(1, this.#index);
    this.setNext(this.#mapFn(par.snapshot.value, this.#index), updaterSymbol);
  }
}
