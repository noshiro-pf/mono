import { Option } from '@noshiro/ts-utils';
import { SyncChildObservableClass } from '../class';
import {
  InitializedToInitializedOperator,
  MapWithIndexOperatorObservable,
  Observable,
  ToBaseOperator,
  Token,
} from '../types';

export const mapWithIndex = <A, B>(
  mapFn: (x: A, index: number) => B
): ToBaseOperator<A, B> => (parent: Observable<A>) =>
  new MapWithIndexObservableClass(parent, mapFn);

export const mapWithIndexI = <A, B>(
  mapFn: (x: A, index: number) => B
): InitializedToInitializedOperator<A, B> =>
  mapWithIndex(mapFn) as InitializedToInitializedOperator<A, B>;

class MapWithIndexObservableClass<A, B>
  extends SyncChildObservableClass<B, 'mapWithIndex', [A]>
  implements MapWithIndexOperatorObservable<A, B> {
  private readonly _mapFn: (x: A, index: number) => B;
  private _index: number;

  constructor(parent: Observable<A>, mapFn: (x: A, index: number) => B) {
    super({
      parents: [parent],
      type: 'mapWithIndex',
      currentValueInit: Option.map<A, B>((x) => mapFn(x, -1))(
        parent.currentValue
      ),
    });
    this._index = -1;
    this._mapFn = mapFn;
  }

  tryUpdate(token: Token): void {
    const parent = this.parents[0];
    if (parent.token !== token) return; // skip update
    if (Option.isNone(parent.currentValue)) return; // skip update

    this._index += 1;
    this.setNext(this._mapFn(parent.currentValue.value, this._index), token);
  }
}
