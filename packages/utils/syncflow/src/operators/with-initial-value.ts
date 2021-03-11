import { Option } from '@noshiro/ts-utils';
import { InitializedSyncChildObservableClass } from '../class';
import {
  Observable,
  ToInitializedOperator,
  Token,
  WithInitialValueOperatorObservable,
} from '../types';

export const withInitialValue = <A, I = A>(
  initialValue: I
): ToInitializedOperator<A, A | I> => (parent: Observable<A>) =>
  new WithInitialValueObservableClass(parent, initialValue);

class WithInitialValueObservableClass<A, I>
  extends InitializedSyncChildObservableClass<A | I, 'withInitialValue', [A]>
  implements WithInitialValueOperatorObservable<A, I> {
  constructor(parent: Observable<A>, initialValue: I) {
    super({
      parents: [parent],
      type: 'withInitialValue',
      currentValueInit: Option.some(initialValue),
    });
  }

  tryUpdate(token: Token): void {
    const parent = this.parents[0];
    if (parent.token !== token) return; // skip update
    if (Option.isNone(parent.currentValue)) return; // skip update

    this.setNext(parent.currentValue.value, token);
  }
}
