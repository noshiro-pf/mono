import { Option } from '@noshiro/ts-utils';
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
  extends SyncChildObservableClass<A, 'skipWhile', [A]>
  implements SkipWhileOperatorObservable<A>
{
  private readonly _predicate: (value: A) => boolean;

  constructor(
    parentObservable: Observable<A>,
    predicate: (value: A) => boolean
  ) {
    super({
      parents: [parentObservable],
      type: 'skipWhile',
      currentValueInit: Option.isNone(parentObservable.currentValue)
        ? Option.none
        : predicate(parentObservable.currentValue.value)
        ? Option.none
        : parentObservable.currentValue,
    });
    this._predicate = predicate;
  }

  tryUpdate(token: Token): void {
    const par = this.parents[0];
    if (par.token !== token) return; // skip update
    if (Option.isNone(par.currentValue)) return; // skip update

    if (!this._predicate(par.currentValue.value)) {
      this.setNext(par.currentValue.value, token);
    }
  }
}
