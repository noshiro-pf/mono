import { Maybe } from '@noshiro/ts-utils';
import { SyncChildObservableClass } from '../class/index.mjs';
import {
  type DropInitialValueOperator,
  type Observable,
  type UpdaterSymbol,
  type WithCurrentValueFromOperatorObservable,
} from '../types/index.mjs';
import { maxDepth } from '../utils/index.mjs';

export const withCurrentValueFrom =
  <A, B>(
    observable: Observable<B>,
  ): DropInitialValueOperator<A, readonly [A, B]> =>
  (parentObservable) =>
    new WithCurrentValueFromObservableClass(parentObservable, observable);

export const withLatestFrom = withCurrentValueFrom; // alias

class WithCurrentValueFromObservableClass<A, B>
  extends SyncChildObservableClass<
    readonly [A, B],
    'withCurrentValueFrom',
    readonly [A]
  >
  implements WithCurrentValueFromOperatorObservable<A, B>
{
  readonly #observable: Observable<B>;

  constructor(parentObservable: Observable<A>, observable: Observable<B>) {
    super({
      parents: [parentObservable],
      depth: 1 + maxDepth([parentObservable, observable]),
      type: 'withCurrentValueFrom',
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
