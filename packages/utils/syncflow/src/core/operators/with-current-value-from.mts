import { Maybe, pipe } from '@noshiro/ts-utils';
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
  extends SyncChildObservableClass<readonly [A, B], readonly [A]>
  implements WithCurrentValueFromOperatorObservable<A, B>
{
  readonly #observable: Observable<B>;

  constructor(parentObservable: Observable<A>, observable: Observable<B>) {
    super({
      parents: [parentObservable],
      depth: 1 + maxDepth([parentObservable, observable]),
      initialValue: pipe({
        par: parentObservable.getSnapshot(),
        me: observable.getSnapshot(),
      }).chain(({ me, par }) =>
        Maybe.isNone(par) || Maybe.isNone(me)
          ? Maybe.none
          : Maybe.some([par.value, me.value] as const),
      ).value,
    });

    this.#observable = observable;
  }

  override tryUpdate(updaterSymbol: UpdaterSymbol): void {
    const par = this.parents[0];
    const ps = par.getSnapshot();

    if (par.updaterSymbol !== updaterSymbol || Maybe.isNone(ps)) {
      return; // skip update
    }

    const curr = this.#observable.getSnapshot();
    if (Maybe.isNone(curr)) return; // skip update

    this.setNext([ps.value, curr.value], updaterSymbol);
  }
}
