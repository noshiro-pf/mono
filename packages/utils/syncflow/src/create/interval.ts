import { Option, TimerId } from '@noshiro/ts-utils';
import { RootObservableClass } from '../class';
import { IntervalObservable } from '../types';

export const interval = (
  millisec: number,
  startManually: boolean = false
): IntervalObservable => new IntervalObservableClass(millisec, startManually);

class IntervalObservableClass
  extends RootObservableClass<number, 'Interval'>
  implements IntervalObservable {
  private readonly _millisec: number;
  private _counter: number;
  private _timerId: TimerId | undefined;
  private _isStarted: boolean;

  constructor(millisec: number, startManually: boolean) {
    super({ type: 'Interval', currentValueInit: Option.none });
    this._millisec = millisec;
    this._counter = -1;
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
      console.warn('start on stopped IntervalObservable is ignored.');
      return this;
    }
    this._timerId = setInterval(() => {
      this._counter += 1;
      this.startUpdate(this._counter);
    }, this._millisec);
    return this;
  }

  private resetTimer(): void {
    if (this._timerId !== undefined) {
      clearInterval(this._timerId);
    }
  }

  // overload
  complete(): void {
    this.resetTimer();
    super.complete();
  }
}
