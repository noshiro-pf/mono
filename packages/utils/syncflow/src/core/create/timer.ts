import { Option } from '@noshiro/ts-utils';
import { RootObservableClass } from '../class';
import type { TimerObservable } from '../types';

export const timer = (
  milliSeconds: number,
  startManually: boolean = false
): TimerObservable => new TimerObservableClass(milliSeconds, startManually);

class TimerObservableClass
  extends RootObservableClass<number, 'Timer'>
  implements TimerObservable
{
  private readonly _milliSeconds: number;
  private _timerId: TimerId | undefined;
  private _isStarted: boolean;

  constructor(milliSeconds: number, startManually: boolean) {
    super({ type: 'Timer', currentValueInit: Option.none });
    this._milliSeconds = milliSeconds;
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
    if (this.isCompleted) {
      console.warn('cannot restart stopped TimerObservable');
      return this;
    }
    this._timerId = setTimeout(() => {
      this.startUpdate(0);
      this.complete();
    }, this._milliSeconds);
    return this;
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
