import { Maybe } from '@noshiro/ts-utils';
import { SyncChildObservableClass } from '../class/index.mjs';
import {
  type DistinctUntilChangedOperatorObservable,
  type InitializedToInitializedOperator,
  type Observable,
  type ToBaseOperator,
  type UpdaterSymbol,
} from '../types/index.mjs';

export const distinctUntilChanged =
  <A,>(eq: (x: A, y: A) => boolean = (x, y) => x === y): ToBaseOperator<A, A> =>
  (parentObservable: Observable<A>) =>
    new DistinctUntilChangedObservableClass(parentObservable, eq);

export const distinctUntilChangedI = <A,>(
  eq: (x: A, y: A) => boolean = (x, y) => x === y,
): InitializedToInitializedOperator<A, A> =>
  // eslint-disable-next-line no-restricted-syntax
  distinctUntilChanged(eq) as InitializedToInitializedOperator<A, A>;

export const skipUnchanged = distinctUntilChanged; // alias
export const skipUnchangedI = distinctUntilChangedI; // alias

class DistinctUntilChangedObservableClass<A>
  extends SyncChildObservableClass<A, 'distinctUntilChanged', readonly [A]>
  implements DistinctUntilChangedOperatorObservable<A>
{
  readonly #eq: (x: A, y: A) => boolean;
  #previousValue: Maybe<A>;

  constructor(parentObservable: Observable<A>, eq: (x: A, y: A) => boolean) {
    super({
      parents: [parentObservable],
      type: 'distinctUntilChanged',
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

    if (Maybe.isNone(prev) || !this.#eq(prev.value, par.snapshot.value)) {
      this.setNext(par.snapshot.value, updaterSymbol);
    }
    this.#previousValue = par.snapshot;
  }
}