import { Option } from '@noshiro/ts-utils';
import { SyncChildObservableClass } from '../class';
import {
  Observable,
  RemoveInitializedOperator,
  TakeWhileOperatorObservable,
  Token,
} from '../types';

export const takeWhile = <A>(
  predicate: (value: A) => boolean
): RemoveInitializedOperator<A, A> => (parent: Observable<A>) =>
  new TakeWhileObservableClass(parent, predicate);

class TakeWhileObservableClass<A>
  extends SyncChildObservableClass<A, 'takeWhile', [A]>
  implements TakeWhileOperatorObservable<A> {
  private readonly _predicate: (value: A) => boolean;

  constructor(parent: Observable<A>, predicate: (value: A) => boolean) {
    super({
      parents: [parent],
      type: 'takeWhile',
      currentValueInit: Option.isNone(parent.currentValue)
        ? Option.none
        : predicate(parent.currentValue.value)
        ? parent.currentValue
        : Option.none,
    });
    this._predicate = predicate;
  }

  tryUpdate(token: Token): void {
    const parent = this.parents[0];
    if (parent.token !== token) return; // skip update
    if (Option.isNone(parent.currentValue)) return; // skip update

    if (this._predicate(parent.currentValue.value)) {
      this.setNext(parent.currentValue.value, token);
    } else {
      this.complete();
    }
  }
}
