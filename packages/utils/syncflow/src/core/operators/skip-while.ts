import { Maybe } from '@noshiro/ts-utils';
import { SyncChildObservableClass } from '../class';
import type {
  Observable,
  RemoveInitializedOperator,
  SkipWhileOperatorObservable,
  Token,
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
    predicate: (value: A) => boolean
  ) {
    super({
      parents: [parentObservable],
      type: 'skipWhile',
      currentValueInit: Maybe.isNone(parentObservable.currentValue)
        ? Maybe.none
        : predicate(parentObservable.currentValue.value)
        ? Maybe.none
        : parentObservable.currentValue,
    });
    this.#predicate = predicate;
  }

  override tryUpdate(token: Token): void {
    const par = this.parents[0];
    if (par.token !== token) return; // skip update
    if (Maybe.isNone(par.currentValue)) return; // skip update

    if (!this.#predicate(par.currentValue.value)) {
      this.setNext(par.currentValue.value, token);
    }
  }
}
