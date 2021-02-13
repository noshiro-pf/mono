import { Option, TimerId } from '@noshiro/ts-utils';
import { SyncChildObservableClass } from '../class';
import {
  Observable,
  Operator,
  ThrottleTimeOperatorObservable,
  Token,
} from '../types';

export const throttleTime = <A>(millisec: number): Operator<A, A> => (
  parent: Observable<A>
) => new ThrottleTimeObservableClass(parent, millisec);

class ThrottleTimeObservableClass<A>
  extends SyncChildObservableClass<A, 'throttleTime', [A]>
  implements ThrottleTimeOperatorObservable<A> {
  private readonly _millisec: number;
  private _timerId: TimerId | undefined;
  private _isSkipping: boolean;

  constructor(parent: Observable<A>, millisec: number) {
    super({
      parents: [parent],
      type: 'throttleTime',
      currentValueInit: parent.currentValue,
    });
    this._timerId = undefined;
    this._isSkipping = false;
    this._millisec = millisec;
  }

  tryUpdate(token: Token): void {
    const parent = this.parents[0];
    if (parent.token !== token) return; // skip update
    if (Option.isNone(parent.currentValue)) return; // skip update
    if (this._isSkipping) return; // skip update

    this.setNext(parent.currentValue.value, token);

    this._isSkipping = true;
    // set timer
    this._timerId = setTimeout(() => {
      this._isSkipping = false;
    }, this._millisec);
  }

  private resetTimer(): void {
    if (this._timerId !== undefined) {
      clearTimeout(this._timerId);
    }
  }

  // overload
  complete(): void {
    this.resetTimer();
    super.complete();
  }
}
