import { Option } from '@noshiro/ts-utils';
import { SyncChildObservableClass } from '../class';
import type {
  InitializedToInitializedOperator,
  MapToOperatorObservable,
  Observable,
  ToBaseOperator,
  Token,
} from '../types';

export const mapTo =
  <A, B>(value: B): ToBaseOperator<A, B> =>
  (parentObservable: Observable<A>) =>
    new MapToObservableClass(parentObservable, value);

export const mapToI = <A, B>(
  value: B
): InitializedToInitializedOperator<A, B> =>
  mapTo(value) as InitializedToInitializedOperator<A, B>;

class MapToObservableClass<A, B>
  extends SyncChildObservableClass<B, 'mapTo', [A]>
  implements MapToOperatorObservable<A, B>
{
  private readonly _value: B;

  constructor(parentObservable: Observable<A>, value: B) {
    super({
      parents: [parentObservable],
      type: 'mapTo',
      currentValueInit: Option.some(value),
    });
    this._value = value;
  }

  tryUpdate(token: Token): void {
    const par = this.parents[0];
    if (par.token !== token) return; // skip update
    if (Option.isNone(par.currentValue)) return; // skip update

    this.setNext(this._value, token);
  }
}
