import { Maybe } from '@noshiro/ts-utils';
import { SyncChildObservableClass } from '../class';
import {
  type InitializedObservable,
  type InitializedToInitializedOperator,
  type Observable,
  type ToBaseOperator,
  type UpdaterSymbol,
  type WithLatestFromOperatorObservable,
} from '../types';
import { maxDepth } from '../utils';

export const withLatestFrom =
  <A, B>(observable: Observable<B>): ToBaseOperator<A, readonly [A, B]> =>
  (parentObservable: Observable<A>) =>
    new WithLatestFromObservableClass(parentObservable, observable);

export const withLatestFromI = <A, B>(
  observable: InitializedObservable<B>
): InitializedToInitializedOperator<A, readonly [A, B]> =>
  withLatestFrom(observable) as InitializedToInitializedOperator<
    A,
    readonly [A, B]
  >;

export const withLatest = withLatestFrom; // alias
export const withLatestI = withLatestFromI; // alias

class WithLatestFromObservableClass<A, B>
  extends SyncChildObservableClass<
    readonly [A, B],
    'withLatestFrom',
    readonly [A]
  >
  implements WithLatestFromOperatorObservable<A, B>
{
  readonly #observable: Observable<B>;

  constructor(parentObservable: Observable<A>, observable: Observable<B>) {
    super({
      parents: [parentObservable],
      depth: 1 + maxDepth([parentObservable, observable]),
      type: 'withLatestFrom',
      currentValueInit:
        Maybe.isNone(parentObservable.currentValue) ||
        Maybe.isNone(observable.currentValue)
          ? Maybe.none
          : Maybe.some([
              parentObservable.currentValue.value,
              observable.currentValue.value,
            ]),
    });

    this.#observable = observable;
  }

  override tryUpdate(updaterSymbol: UpdaterSymbol): void {
    const par = this.parents[0];
    if (par.updaterSymbol !== updaterSymbol || Maybe.isNone(par.currentValue)) {
      return; // skip update
    }

    const curr = this.#observable.currentValue;
    if (Maybe.isNone(curr)) return; // skip update

    this.setNext([par.currentValue.value, curr.value], updaterSymbol);
  }
}
