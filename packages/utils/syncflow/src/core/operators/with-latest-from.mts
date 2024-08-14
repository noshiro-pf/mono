import { Maybe } from '@noshiro/ts-utils';
import { SyncChildObservableClass } from '../class/index.mjs';
import {
  type InitializedObservable,
  type InitializedToInitializedOperator,
  type Observable,
  type ToUninitializedOperator,
  type UpdaterSymbol,
  type WithLatestFromOperatorObservable,
} from '../types/index.mjs';
import { maxDepth } from '../utils/index.mjs';

export const withLatestFrom =
  <A, B>(
    observable: Observable<B>,
  ): ToUninitializedOperator<A, readonly [A, B]> =>
  (parentObservable: Observable<A>) =>
    new WithLatestFromObservableClass(parentObservable, observable);

export const withLatestFromI = <A, B>(
  observable: InitializedObservable<B>,
): InitializedToInitializedOperator<A, readonly [A, B]> =>
  // eslint-disable-next-line total-functions/no-unsafe-type-assertion
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
      initialValue:
        Maybe.isNone(parentObservable.snapshot) ||
        Maybe.isNone(observable.snapshot)
          ? Maybe.none
          : Maybe.some([
              parentObservable.snapshot.value,
              observable.snapshot.value,
            ]),
    });

    this.#observable = observable;
  }

  override tryUpdate(updaterSymbol: UpdaterSymbol): void {
    const par = this.parents[0];
    if (par.updaterSymbol !== updaterSymbol || Maybe.isNone(par.snapshot)) {
      return; // skip update
    }

    const curr = this.#observable.snapshot;
    if (Maybe.isNone(curr)) return; // skip update

    this.setNext([par.snapshot.value, curr.value], updaterSymbol);
  }
}
