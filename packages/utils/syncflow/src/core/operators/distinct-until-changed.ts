import { Maybe } from '@noshiro/ts-utils';
import { SyncChildObservableClass } from '../class';
import type {
  DistinctUntilChangedOperatorObservable,
  InitializedToInitializedOperator,
  Observable,
  ToBaseOperator,
  Token,
} from '../types';

export const distinctUntilChanged =
  <A>(
    compare: (x: A, y: A) => boolean = (x, y) => x === y
  ): ToBaseOperator<A, A> =>
  (parentObservable: Observable<A>) =>
    new DistinctUntilChangedObservableClass(parentObservable, compare);

export const distinctUntilChangedI = <A>(
  compare: (x: A, y: A) => boolean = (x, y) => x === y
): InitializedToInitializedOperator<A, A> =>
  distinctUntilChanged(compare) as InitializedToInitializedOperator<A, A>;

export const skipUnchanged = distinctUntilChanged; // alias
export const skipUnchangedI = distinctUntilChangedI; // alias

class DistinctUntilChangedObservableClass<A>
  extends SyncChildObservableClass<A, 'distinctUntilChanged', readonly [A]>
  implements DistinctUntilChangedOperatorObservable<A>
{
  readonly #compare: (x: A, y: A) => boolean;
  #previousValue: Maybe<A>;

  constructor(
    parentObservable: Observable<A>,
    compare: (x: A, y: A) => boolean
  ) {
    super({
      parents: [parentObservable],
      type: 'distinctUntilChanged',
      currentValueInit: parentObservable.currentValue,
    });
    this.#previousValue = Maybe.none;
    this.#compare = compare;
  }

  override tryUpdate(token: Token): void {
    const par = this.parents[0];
    if (par.token !== token) return; // skip update
    if (Maybe.isNone(par.currentValue)) return; // skip update

    const prev = this.#previousValue;
    this.#previousValue = par.currentValue;

    if (
      Maybe.isNone(prev) ||
      !this.#compare(prev.value, par.currentValue.value)
    ) {
      this.setNext(par.currentValue.value, token);
    }
  }
}
