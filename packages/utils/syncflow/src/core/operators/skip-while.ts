import { Maybe } from '@noshiro/ts-utils';
import { SyncChildObservableClass } from '../class';
import {
  type Observable,
  type RemoveInitializedOperator,
  type SkipWhileOperatorObservable,
  type UpdaterSymbol,
} from '../types';

export const skipWhile =
  <A>(predicate: (value: A) => boolean): RemoveInitializedOperator<A, A> =>
  (parentObservable: Observable<A>) =>
    new SkipWhileObservableClass(parentObservable, predicate);

class SkipWhileObservableClass<A>
  extends SyncChildObservableClass<A, 'skipWhile', readonly [A]>
  implements SkipWhileOperatorObservable<A>
{
  readonly #predicate: (value: A) => boolean;

  constructor(
    parentObservable: Observable<A>,
    predicate: (value: A) => boolean,
  ) {
    super({
      parents: [parentObservable],
      type: 'skipWhile',
      initialValue: Maybe.isNone(parentObservable.snapshot)
        ? Maybe.none
        : predicate(parentObservable.snapshot.value)
        ? Maybe.none
        : parentObservable.snapshot,
    });
    this.#predicate = predicate;
  }

  override tryUpdate(updaterSymbol: UpdaterSymbol): void {
    const par = this.parents[0];
    if (par.updaterSymbol !== updaterSymbol || Maybe.isNone(par.snapshot)) {
      return; // skip update
    }

    if (!this.#predicate(par.snapshot.value)) {
      this.setNext(par.snapshot.value, updaterSymbol);
    }
  }
}
