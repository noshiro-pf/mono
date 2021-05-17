import { Option } from '@noshiro/ts-utils';
import { InitializedSyncChildObservableClass } from '../class';
import type {
  Observable,
  ScanOperatorObservable,
  ToInitializedOperator,
  Token,
} from '../types';

export const scan =
  <A, B>(
    reducer: (acc: B, curr: A) => B,
    initialValue: B
  ): ToInitializedOperator<A, B> =>
  (parentObservable: Observable<A>) =>
    new ScanObservableClass(parentObservable, reducer, initialValue);

class ScanObservableClass<A, B>
  extends InitializedSyncChildObservableClass<B, 'scan', [A]>
  implements ScanOperatorObservable<A, B>
{
  private readonly _reducer: (acc: B, curr: A) => B;

  constructor(
    parentObservable: Observable<A>,
    reducer: (acc: B, curr: A) => B,
    initialValue: B
  ) {
    super({
      parents: [parentObservable],
      type: 'scan',
      currentValueInit: Option.some(initialValue),
    });
    this._reducer = reducer;
  }

  tryUpdate(token: Token): void {
    const par = this.parents[0];
    if (par.token !== token) return; // skip update
    if (Option.isNone(par.currentValue)) return; // skip update
    if (Option.isNone(this.currentValue)) return; // dummy

    this.setNext(
      this._reducer(this.currentValue.value, par.currentValue.value),
      token
    );
  }
}
