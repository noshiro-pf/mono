import { Option } from '@noshiro/ts-utils';
import { SyncChildObservableClass } from '../class';
import type {
  Observable,
  RemoveInitializedOperator,
  TakeWhileOperatorObservable,
  Token,
} from '../types';

export const takeWhile =
  <A>(predicate: (value: A) => boolean): RemoveInitializedOperator<A, A> =>
  (parentObservable: Observable<A>) =>
    new TakeWhileObservableClass(parentObservable, predicate);

class TakeWhileObservableClass<A>
  extends SyncChildObservableClass<A, 'takeWhile', readonly [A]>
  implements TakeWhileOperatorObservable<A>
{
  private readonly _predicate: (value: A) => boolean;

  constructor(
    parentObservable: Observable<A>,
    predicate: (value: A) => boolean
  ) {
    super({
      parents: [parentObservable],
      type: 'takeWhile',
      currentValueInit: Option.isNone(parentObservable.currentValue)
        ? Option.none
        : predicate(parentObservable.currentValue.value)
        ? parentObservable.currentValue
        : Option.none,
    });
    this._predicate = predicate;
  }

  override tryUpdate(token: Token): void {
    const par = this.parents[0];
    if (par.token !== token) return; // skip update
    if (Option.isNone(par.currentValue)) return; // skip update

    if (this._predicate(par.currentValue.value)) {
      this.setNext(par.currentValue.value, token);
    } else {
      this.complete();
    }
  }
}
