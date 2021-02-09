import { Option, TimerId } from '@mono/ts-utils';
import { RootObservableClass } from '../class';
import { IntervalObservable } from '../types';

export const interval = (
  millisec: number,
  startRightNow: boolean = true
): IntervalObservable => new IntervalObservableClass(millisec, startRightNow);

class IntervalObservableClass
  extends RootObservableClass<number, 'Interval'>
  implements IntervalObservable {
  private readonly _millisec: number;
  private _counter: number = 0;
  private _timerId: TimerId | undefined = undefined;

  constructor(millisec: number, startRightNow: boolean) {
    super({ type: 'Interval', currentValueInit: Option.none });
    this._millisec = millisec;
    if (startRightNow) {
      this.start();
    }
  }

  start(): this {
    if (this.isCompleted) {
      console.warn('start on stopped IntervalObservable is ignored.');
      return this;
    }
    setTimeout(() => {
      this.startUpdate(0);
    }, 0);
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
