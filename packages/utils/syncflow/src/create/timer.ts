import type { TimerId } from '@noshiro/ts-utils';
import { Option } from '@noshiro/ts-utils';
import { RootObservableClass } from '../class';
import type { TimerObservable } from '../types';

export const timer = (
  millisec: number,
  startManually: boolean = false
): TimerObservable => new TimerObservableClass(millisec, startManually);

class TimerObservableClass
  extends RootObservableClass<number, 'Timer'>
  implements TimerObservable
{
  private readonly _millisec: number;
  private _timerId: TimerId | undefined;
  private _isStarted: boolean;

  constructor(millisec: number, startManually: boolean) {
    super({ type: 'Timer', currentValueInit: Option.none });
    this._millisec = millisec;
    this._timerId = undefined;
    this._isStarted = false;
    if (!startManually) {
      this.start();
    }
  }

  start(): this {
    if (this._isStarted) {
      console.warn('cannot start twice');
      return this;
    }
    this._isStarted = true;
    if (this.isCompleted) return this;
    this._timerId = setTimeout(() => {
      this.startUpdate(0);
    }, this._millisec);
    return this;
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
