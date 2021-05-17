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
  <A>(millisec: number): ToBaseOperator<A, A> =>
  (parentObservable: Observable<A>) =>
    new AuditTimeObservableClass(parentObservable, millisec);

export const auditTimeI = <A>(
  millisec: number
): InitializedToInitializedOperator<A, A> =>
  auditTime(millisec) as InitializedToInitializedOperator<A, A>;

class AuditTimeObservableClass<A>
  extends AsyncChildObservableClass<A, 'auditTime', [A]>
  implements AuditTimeOperatorObservable<A>
{
  private readonly _millisec: number;
  private _timerId: TimerId | undefined;
  private _isSkipping: boolean;

  constructor(parentObservable: Observable<A>, millisec: number) {
    super({
      parents: [parentObservable],
      type: 'auditTime',
      currentValueInit: parentObservable.currentValue,
    });
    this._isSkipping = false;
    this._timerId = undefined;
    this._millisec = millisec;
  }

  tryUpdate(token: Token): void {
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
