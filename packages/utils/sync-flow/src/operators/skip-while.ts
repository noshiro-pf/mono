import { Option } from '@noshiro/ts-utils';
import { SyncChildObservableClass } from '../class';
import {
  Observable,
  Operator,
  SkipWhileOperatorObservable,
  Token,
} from '../types';

export const skipWhile = <A>(
  predicate: (value: A) => boolean
): Operator<A, A> => (parent: Observable<A>) =>
  new SkipWhileObservableClass(parent, predicate);

class SkipWhileObservableClass<A>
  extends SyncChildObservableClass<A, 'skipWhile', [A]>
  implements SkipWhileOperatorObservable<A> {
  private readonly _predicate: (value: A) => boolean;

  constructor(parent: Observable<A>, predicate: (value: A) => boolean) {
    super({
      parents: [parent],
      type: 'skipWhile',
      currentValueInit: Option.none,
    });
    this._predicate = predicate;
  }

  tryUpdate(token: Token): void {
    const parent = this.parents[0];
    if (parent.token !== token) return; // skip update
    if (Option.isNone(parent.currentValue)) return; // skip update

    if (!this._predicate(parent.currentValue.value)) {
      this.setNext(parent.currentValue.value, token);
    }
  }
}
