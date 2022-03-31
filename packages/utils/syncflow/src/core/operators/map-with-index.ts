import { Maybe } from '@noshiro/ts-utils';
import { SyncChildObservableClass } from '../class';
import type {
  InitializedToInitializedOperator,
  MapWithIndexOperatorObservable,
  Observable,
  ToBaseOperator,
  Token,
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
  private readonly _mapFn: (x: A, index: number) => B;
  private _index: number;

  constructor(
    parentObservable: Observable<A>,
    mapFn: (x: A, index: number) => B
  ) {
    super({
      parents: [parentObservable],
      type: 'mapWithIndex',
      currentValueInit: Maybe.map<A, B>((x) => mapFn(x, -1))(
        parentObservable.currentValue
      ),
    });
    this._index = -1;
    this._mapFn = mapFn;
  }

  override tryUpdate(token: Token): void {
    const par = this.parents[0];
    if (par.token !== token) return; // skip update
    if (Maybe.isNone(par.currentValue)) return; // skip update

    this._index += 1;
    this.setNext(this._mapFn(par.currentValue.value, this._index), token);
  }
}
