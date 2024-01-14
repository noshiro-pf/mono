import { Maybe } from '@noshiro/ts-utils';
import { SyncChildObservableClass } from '../class/index.mjs';
import {
  type FilterOperatorObservable,
  type Observable,
  type RemoveInitializedOperator,
  type UpdaterSymbol,
} from '../types/index.mjs';

export function filter<A, B extends A>(
  predicate: (value: A) => value is B,
): RemoveInitializedOperator<A, B>;
export function filter<A>(
  predicate: (value: A) => boolean,
): RemoveInitializedOperator<A, A>;
export function filter<A>(
  predicate: (value: A) => boolean,
): RemoveInitializedOperator<A, A> {
  return (parentObservable: Observable<A>) =>
    new FilterObservableClass(parentObservable, predicate);
}

class FilterObservableClass<A>
  extends SyncChildObservableClass<A, 'filter', readonly [A]>
  implements FilterOperatorObservable<A>
{
  readonly #predicate: (x: A) => boolean;

  constructor(parentObservable: Observable<A>, predicate: (x: A) => boolean) {
    super({
      parents: [parentObservable],
      type: 'filter',
      initialValue: Maybe.isNone(parentObservable.snapshot)
        ? Maybe.none
        : predicate(parentObservable.snapshot.value)
          ? parentObservable.snapshot
          : Maybe.none,
    });
    this.#predicate = predicate;
  }

  override tryUpdate(updaterSymbol: UpdaterSymbol): void {
    const par = this.parents[0];
    if (par.updaterSymbol !== updaterSymbol || Maybe.isNone(par.snapshot)) {
      return; // skip update
    }

    if (this.#predicate(par.snapshot.value)) {
      this.setNext(par.snapshot.value, updaterSymbol);
    }
  }
}
