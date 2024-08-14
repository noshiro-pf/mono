import { Maybe } from '@noshiro/ts-utils';
import { SyncChildObservableClass } from '../class/index.mjs';
import {
  type KeepInitialValueOperator,
  type Observable,
  type SkipIfNoChangeOperatorObservable,
  type UpdaterSymbol,
} from '../types/index.mjs';

export const skipIfNoChange = <A,>(
  eq: (x: A, y: A) => boolean = (x, y) => x === y,
): KeepInitialValueOperator<A, A> =>
  // eslint-disable-next-line total-functions/no-unsafe-type-assertion
  ((parentObservable) =>
    new SkipIfNoChangeObservableClass(
      parentObservable,
      eq,
    )) as KeepInitialValueOperator<A, A>;

export const distinctUntilChanged = skipIfNoChange; // alias

class SkipIfNoChangeObservableClass<A>
  extends SyncChildObservableClass<A, 'skipIfNoChange', readonly [A]>
  implements SkipIfNoChangeOperatorObservable<A>
{
  readonly #eq: (x: A, y: A) => boolean;
  #previousValue: Maybe<A>;

  constructor(parentObservable: Observable<A>, eq: (x: A, y: A) => boolean) {
    super({
      parents: [parentObservable],
      type: 'skipIfNoChange',
      initialValue: parentObservable.snapshot,
    });
    // parentObservable.snapshot has value
    // if parentObservable is InitializedObservable
    this.#previousValue = parentObservable.snapshot;
    this.#eq = eq;
  }

  override tryUpdate(updaterSymbol: UpdaterSymbol): void {
    const par = this.parents[0];

    if (par.updaterSymbol !== updaterSymbol || Maybe.isNone(par.snapshot)) {
      return; // skip update
    }

    const prev = this.#previousValue;

    const cond =
      Maybe.isNone(prev) || !this.#eq(prev.value, par.snapshot.value);

    // NOTE: setNext より先に更新しないと tryUpdate が連続して呼ばれたときに Maybe.isNone(prev) が true になり続けてしまう
    this.#previousValue = par.snapshot;

    if (cond) {
      this.setNext(par.snapshot.value, updaterSymbol);
    }
  }
}
