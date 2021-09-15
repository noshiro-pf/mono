import { Option } from '@noshiro/ts-utils';
import { RootObservableClass } from '../class';
import type { IntervalObservable } from '../types';

export const interval = (
  milliSeconds: number,
  startManually?: boolean
): IntervalObservable =>
  new IntervalObservableClass(milliSeconds, startManually);

class IntervalObservableClass
  extends RootObservableClass<number, 'Interval'>
  implements IntervalObservable
{
  private readonly _milliSeconds: number;
  private _counter: number;
  private _timerId0: TimerId | undefined;
  private _timerId: TimerId | undefined;
  private _isStarted: boolean;

  constructor(milliSeconds: number, startManually?: boolean) {
    super({ type: 'Interval', currentValueInit: Option.none });
    this._milliSeconds = milliSeconds;
    this._counter = 0;
    this._timerId0 = undefined;
    this._timerId = undefined;
    this._isStarted = false;
    if (startManually !== true) {
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
      console.warn('cannot restart stopped IntervalObservable');
      return this;
    }

    // emit zero
    this._timerId0 = setTimeout(() => {
      this.startUpdate(this._counter);
    }, 0);

    this._timerId = setInterval(() => {
      this._counter += 1;
      this.startUpdate(this._counter);
    }, this._milliSeconds);

    return this;
  }

  private resetTimer(): void {
    if (this._timerId0 !== undefined && this._timerId !== undefined) {
      clearInterval(this._timerId0);
      clearInterval(this._timerId);
    }
  }

  override complete(): void {
    this.resetTimer();
    super.complete();
  }
}
