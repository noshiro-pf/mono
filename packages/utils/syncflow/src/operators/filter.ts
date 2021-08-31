import { Option } from '@noshiro/ts-utils';
import { SyncChildObservableClass } from '../class';
import type {
  FilterOperatorObservable,
  Observable,
  RemoveInitializedOperator,
  Token,
} from '../types';

export function filter<A, B extends A>(
  predicate: (value: A) => value is B
): RemoveInitializedOperator<A, B>;
export function filter<A>(
  predicate: (value: A) => boolean
): RemoveInitializedOperator<A, A>;
export function filter<A>(
  predicate: (value: A) => boolean
): RemoveInitializedOperator<A, A> {
  return (parentObservable: Observable<A>) =>
    new FilterObservableClass(parentObservable, predicate);
}

class FilterObservableClass<A>
  extends SyncChildObservableClass<A, 'filter', readonly [A]>
  implements FilterOperatorObservable<A>
{
  private readonly _predicate: (x: A) => boolean;

  constructor(parentObservable: Observable<A>, predicate: (x: A) => boolean) {
    super({
      parents: [parentObservable],
      type: 'filter',
      currentValueInit: Option.isNone(parentObservable.currentValue)
        ? Option.none
        : predicate(parentObservable.currentValue.value)
        ? parentObservable.currentValue
        : Option.none,
    });
    this._predicate = predicate;
  }

  override tryUpdate(token: Token): void {
    const par = this.parents[0];
    if (par.token !== token) return; // skip update
    if (Option.isNone(par.currentValue)) return; // skip update

    if (this._predicate(par.currentValue.value)) {
      this.setNext(par.currentValue.value, token);
    }
  }
}
