import { Maybe } from '@noshiro/ts-utils';
import { SyncChildObservableClass } from '../class/index.mjs';
import {
  type Observable,
  type TakeWhileOperatorObservable,
  type ToUninitializedOperator,
  type UpdaterSymbol,
} from '../types/index.mjs';

export const takeWhile =
  <A,>(predicate: (value: A) => boolean): ToUninitializedOperator<A, A> =>
  (parentObservable: Observable<A>) =>
    new TakeWhileObservableClass(parentObservable, predicate);

class TakeWhileObservableClass<A>
  extends SyncChildObservableClass<A, 'takeWhile', readonly [A]>
  implements TakeWhileOperatorObservable<A>
{
  readonly #predicate: (value: A) => boolean;

  constructor(
    parentObservable: Observable<A>,
    predicate: (value: A) => boolean,
  ) {
    super({
      parents: [parentObservable],
      type: 'takeWhile',
      initialValue: Maybe.isNone(parentObservable.snapshot)
        ? Maybe.none
        : predicate(parentObservable.snapshot.value)
          ? parentObservable.snapshot
          : Maybe.none,
    });
    this.#predicate = predicate;
  }

  override tryUpdate(updaterSymbol: UpdaterSymbol): void {
    const par = this.parents[0];
    if (par.updaterSymbol !== updaterSymbol || Maybe.isNone(par.snapshot)) {
      return; // skip update
    }

    if (this.#predicate(par.snapshot.value)) {
      this.setNext(par.snapshot.value, updaterSymbol);
    } else {
      this.complete();
    }
  }
}
