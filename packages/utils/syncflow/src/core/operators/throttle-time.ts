import { Maybe } from '@noshiro/ts-utils';
import { SyncChildObservableClass } from '../class';
import type {
  InitializedToInitializedOperator,
  Observable,
  ThrottleTimeOperatorObservable,
  ToBaseOperator,
  Token,
} from '../types';

export const throttleTime =
  <A>(milliSeconds: number): ToBaseOperator<A, A> =>
  (parentObservable: Observable<A>) =>
    new ThrottleTimeObservableClass(parentObservable, milliSeconds);

export const throttleTimeI = <A>(
  milliSeconds: number
): InitializedToInitializedOperator<A, A> =>
  throttleTime(milliSeconds) as InitializedToInitializedOperator<A, A>;

class ThrottleTimeObservableClass<A>
  extends SyncChildObservableClass<A, 'throttleTime', readonly [A]>
  implements ThrottleTimeOperatorObservable<A>
{
  private readonly _milliSeconds: number;
  private _mut_timerId: TimerId | undefined;
  private _mut_isSkipping: boolean;

  constructor(parentObservable: Observable<A>, milliSeconds: number) {
    super({
      parents: [parentObservable],
      type: 'throttleTime',
      currentValueInit: parentObservable.currentValue,
    });
    this._mut_timerId = undefined;
    this._mut_isSkipping = false;
    this._milliSeconds = milliSeconds;
  }

  override tryUpdate(token: Token): void {
    const par = this.parents[0];
    if (par.token !== token) return; // skip update
    if (Maybe.isNone(par.currentValue)) return; // skip update
    if (this._mut_isSkipping) return; // skip update

    this.setNext(par.currentValue.value, token);

    this._mut_isSkipping = true;
    // set timer
    this._mut_timerId = setTimeout(() => {
      this._mut_isSkipping = false;
    }, this._milliSeconds);
  }

  private resetTimer(): void {
    if (this._mut_timerId !== undefined) {
      clearTimeout(this._mut_timerId);
    }
  }

  override complete(): void {
    this.resetTimer();
    super.complete();
  }
}
