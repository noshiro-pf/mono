import type { TimerId } from '@noshiro/ts-utils';
import { Option } from '@noshiro/ts-utils';
import { AsyncChildObservableClass } from '../class';
import type {
  AuditTimeOperatorObservable,
  InitializedToInitializedOperator,
  Observable,
  ToBaseOperator,
  Token,
} from '../types';

export const auditTime =
  <A>(milliSeconds: number): ToBaseOperator<A, A> =>
  (parentObservable: Observable<A>) =>
    new AuditTimeObservableClass(parentObservable, milliSeconds);

export const auditTimeI = <A>(
  milliSeconds: number
): InitializedToInitializedOperator<A, A> =>
  auditTime(milliSeconds) as InitializedToInitializedOperator<A, A>;

class AuditTimeObservableClass<A>
  extends AsyncChildObservableClass<A, 'auditTime', [A]>
  implements AuditTimeOperatorObservable<A>
{
  private readonly _milliSeconds: number;
  private _timerId: TimerId | undefined;
  private _isSkipping: boolean;

  constructor(parentObservable: Observable<A>, milliSeconds: number) {
    super({
      parents: [parentObservable],
      type: 'auditTime',
      currentValueInit: parentObservable.currentValue,
    });
    this._isSkipping = false;
    this._timerId = undefined;
    this._milliSeconds = milliSeconds;
  }

  override tryUpdate(token: Token): void {
    const par = this.parents[0];
    if (par.token !== token) return; // skip update
    if (Option.isNone(par.currentValue)) return; // skip update
    if (this._isSkipping) return; // skip update

    // set timer
    this._isSkipping = true;
    this._timerId = setTimeout(() => {
      if (Option.isNone(par.currentValue)) return;
      this.startUpdate(par.currentValue.value);
      this._isSkipping = false;
    }, this._milliSeconds);
  }

  private resetTimer(): void {
    if (this._timerId !== undefined) {
      clearTimeout(this._timerId);
    }
  }

  override complete(): void {
    this.resetTimer();
    super.complete();
  }
}
