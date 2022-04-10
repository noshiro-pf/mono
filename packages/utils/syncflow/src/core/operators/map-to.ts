import { Maybe } from '@noshiro/ts-utils';
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
  extends SyncChildObservableClass<B, 'mapTo', readonly [A]>
  implements MapToOperatorObservable<A, B>
{
  readonly #value: B;

  constructor(parentObservable: Observable<A>, value: B) {
    super({
      parents: [parentObservable],
      type: 'mapTo',
      currentValueInit: Maybe.map(() => value)(parentObservable.currentValue),
    });
    this.#value = value;
  }

  override tryUpdate(token: Token): void {
    const par = this.parents[0];
    if (par.token !== token) return; // skip update
    if (Maybe.isNone(par.currentValue)) return; // skip update

    this.setNext(this.#value, token);
  }
}
