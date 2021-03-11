import { Option } from '@noshiro/ts-utils';
import { InitializedSyncChildObservableClass } from '../class';
import {
  Observable,
  ScanOperatorObservable,
  ToInitializedOperator,
  Token,
} from '../types';

export const scan = <A, B>(
  reducer: (acc: B, curr: A) => B,
  initialValue: B
): ToInitializedOperator<A, B> => (parent: Observable<A>) =>
  new ScanObservableClass(parent, reducer, initialValue);

class ScanObservableClass<A, B>
  extends InitializedSyncChildObservableClass<B, 'scan', [A]>
  implements ScanOperatorObservable<A, B> {
  private readonly _reducer: (acc: B, curr: A) => B;

  constructor(
    parent: Observable<A>,
    reducer: (acc: B, curr: A) => B,
    initialValue: B
  ) {
    super({
      parents: [parent],
      type: 'scan',
      currentValueInit: Option.some(initialValue),
    });
    this._reducer = reducer;
  }

  tryUpdate(token: Token): void {
    const parent = this.parents[0];
    if (parent.token !== token) return; // skip update
    if (Option.isNone(parent.currentValue)) return; // skip update
    if (Option.isNone(this.currentValue)) return; // dummy

    this.setNext(
      this._reducer(this.currentValue.value, parent.currentValue.value),
      token
    );
  }
}
