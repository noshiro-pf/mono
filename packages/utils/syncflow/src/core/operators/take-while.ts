import { Maybe } from '@noshiro/ts-utils';
import { SyncChildObservableClass } from '../class';
import {
  type Observable,
  type RemoveInitializedOperator,
  type TakeWhileOperatorObservable,
  type UpdaterSymbol,
} from '../types';

export const takeWhile =
  <A>(predicate: (value: A) => boolean): RemoveInitializedOperator<A, A> =>
  (parentObservable: Observable<A>) =>
    new TakeWhileObservableClass(parentObservable, predicate);

class TakeWhileObservableClass<A>
  extends SyncChildObservableClass<A, 'takeWhile', readonly [A]>
  implements TakeWhileOperatorObservable<A>
{
  readonly #predicate: (value: A) => boolean;

  constructor(
    parentObservable: Observable<A>,
    predicate: (value: A) => boolean
  ) {
    super({
      parents: [parentObservable],
      type: 'takeWhile',
      currentValueInit: Maybe.isNone(parentObservable.currentValue)
        ? Maybe.none
        : predicate(parentObservable.currentValue.value)
        ? parentObservable.currentValue
        : Maybe.none,
    });
    this.#predicate = predicate;
  }

  override tryUpdate(updaterSymbol: UpdaterSymbol): void {
    const par = this.parents[0];
    if (par.updaterSymbol !== updaterSymbol || Maybe.isNone(par.currentValue)) {
      return; // skip update
    }

    if (this.#predicate(par.currentValue.value)) {
      this.setNext(par.currentValue.value, updaterSymbol);
    } else {
      this.complete();
    }
  }
}
