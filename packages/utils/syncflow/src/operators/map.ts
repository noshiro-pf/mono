import { Option } from '@noshiro/ts-utils';
import { SyncChildObservableClass } from '../class';
import type {
  InitializedToInitializedOperator,
  MapOperatorObservable,
  Observable,
  ToBaseOperator,
  Token,
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
  private readonly _mapFn: (x: A) => B;

  constructor(parentObservable: Observable<A>, mapFn: (x: A) => B) {
    super({
      parents: [parentObservable],
      type: 'map',
      currentValueInit: Option.map(mapFn)(parentObservable.currentValue),
    });
    this._mapFn = mapFn;
  }

  override tryUpdate(token: Token): void {
    const par = this.parents[0];
    if (par.token !== token) return; // skip update
    if (Option.isNone(par.currentValue)) return; // skip update

    this.setNext(this._mapFn(par.currentValue.value), token);
  }
}
