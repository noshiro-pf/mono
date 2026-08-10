import { Maybe } from '@noshiro/ts-utils';
import { SyncChildObservableClass } from '../class/index.mjs';
import {
  type KeepInitialValueOperator,
  type Observable,
  type SkipIfNoChangeOperatorObservable,
  type UpdaterSymbol,
} from '../types/index.mjs';

export const skipIfNoChange = <A,>(
  eq: (x: A, y: A) => boolean = (x, y) => Object.is(x, y),
): KeepInitialValueOperator<A, A> =>
  // eslint-disable-next-line total-functions/no-unsafe-type-assertion
  ((parentObservable) =>
    new SkipIfNoChangeObservableClass(
      parentObservable,
      eq,
    )) as KeepInitialValueOperator<A, A>;

export const distinctUntilChanged = skipIfNoChange; // alias

class SkipIfNoChangeObservableClass<A>
  extends SyncChildObservableClass<A, readonly [A]>
  implements SkipIfNoChangeOperatorObservable<A>
{
  readonly #eq: (x: A, y: A) => boolean;
  #previousValue: Maybe<A>;

  constructor(parentObservable: Observable<A>, eq: (x: A, y: A) => boolean) {
    super({
      parents: [parentObservable],
      initialValue: parentObservable.getSnapshot(),
    });
    // parentObservable.snapshot has value
    // if parentObservable is InitializedObservable
    this.#previousValue = parentObservable.getSnapshot();
    this.#eq = eq;
  }

  override tryUpdate(updaterSymbol: UpdaterSymbol): void {
    const par = this.parents[0];
    const sn = par.getSnapshot();

    if (par.updaterSymbol !== updaterSymbol || Maybe.isNone(sn)) {
      return; // skip update
    }

    const prev = this.#previousValue;

    const cond = Maybe.isNone(prev) || !this.#eq(prev.value, sn.value);

    // NOTE: setNext より先に更新しないと tryUpdate が連続して呼ばれたときに Maybe.isNone(prev) が true になり続けてしまう
    this.#previousValue = sn;

    if (cond) {
      this.setNext(sn.value, updaterSymbol);
    }
  }
}
