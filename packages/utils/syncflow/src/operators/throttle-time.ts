import type { TimerId } from '@noshiro/ts-utils';
import { Option } from '@noshiro/ts-utils';
import { SyncChildObservableClass } from '../class';
import type {
  InitializedToInitializedOperator,
  Observable,
  ThrottleTimeOperatorObservable,
  ToBaseOperator,
  Token,
} from '../types';

export const throttleTime =
  <A>(millisec: number): ToBaseOperator<A, A> =>
  (parentObservable: Observable<A>) =>
    new ThrottleTimeObservableClass(parentObservable, millisec);

export const throttleTimeI = <A>(
  millisec: number
): InitializedToInitializedOperator<A, A> =>
  throttleTime(millisec) as InitializedToInitializedOperator<A, A>;

class ThrottleTimeObservableClass<A>
  extends SyncChildObservableClass<A, 'throttleTime', [A]>
  implements ThrottleTimeOperatorObservable<A>
{
  private readonly _millisec: number;
  private _timerId: TimerId | undefined;
  private _isSkipping: boolean;

  constructor(parentObservable: Observable<A>, millisec: number) {
    super({
      parents: [parentObservable],
      type: 'throttleTime',
      currentValueInit: parentObservable.currentValue,
    });
    this._timerId = undefined;
    this._isSkipping = false;
    this._millisec = millisec;
  }

  tryUpdate(token: Token): void {
    const par = this.parents[0];
    if (par.token !== token) return; // skip update
    if (Option.isNone(par.currentValue)) return; // skip update
    if (this._isSkipping) return; // skip update

    this.setNext(par.currentValue.value, token);

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
