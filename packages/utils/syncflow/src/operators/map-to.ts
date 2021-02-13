import { Option } from '@noshiro/ts-utils';
import { SyncChildObservableClass } from '../class';
import { MapToOperatorObservable, Observable, Operator, Token } from '../types';

export const mapTo = <A, B>(value: B): Operator<A, B> => (
  parent: Observable<A>
) => new MapToObservableClass(parent, value);

class MapToObservableClass<A, B>
  extends SyncChildObservableClass<B, 'mapTo', [A]>
  implements MapToOperatorObservable<A, B> {
  private readonly _value: B;

  constructor(parent: Observable<A>, value: B) {
    super({
      parents: [parent],
      type: 'mapTo',
      currentValueInit: Option.some(value),
    });
    this._value = value;
  }

  tryUpdate(token: Token): void {
    const parent = this.parents[0];
    if (parent.token !== token) return; // skip update
    if (Option.isNone(parent.currentValue)) return; // skip update

    this.setNext(this._value, token);
  }
}
