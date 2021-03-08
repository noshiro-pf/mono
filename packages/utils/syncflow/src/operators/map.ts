import { Option } from '@noshiro/ts-utils';
import { SyncChildObservableClass } from '../class';
import { MapOperatorObservable, Observable, Operator, Token } from '../types';

export const map = <A, B>(mapFn: (x: A) => B): Operator<A, B> => (
  parent: Observable<A>
) => new MapObservableClass(parent, mapFn);

class MapObservableClass<A, B>
  extends SyncChildObservableClass<B, 'map', [A]>
  implements MapOperatorObservable<A, B> {
  private readonly _mapFn: (x: A) => B;

  constructor(parent: Observable<A>, mapFn: (x: A) => B) {
    super({
      parents: [parent],
      type: 'map',
      currentValueInit: Option.none,
    });
    this._mapFn = mapFn;
  }

  tryUpdate(token: Token): void {
    const parent = this.parents[0];
    if (parent.token !== token) return; // skip update
    if (Option.isNone(parent.currentValue)) return; // skip update

    this.setNext(this._mapFn(parent.currentValue.value), token);
  }
}
