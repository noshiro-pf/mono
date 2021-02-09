import { Option, TimerId } from '@mono/ts-utils';
import { RootObservableClass } from '../class';
import { TimerObservable } from '../types';

export const timer = (
  millisec: number,
  startRightNow: boolean = true
): TimerObservable => new TimerObservableClass(millisec, startRightNow);

class TimerObservableClass
  extends RootObservableClass<number, 'Timer'>
  implements TimerObservable {
  private readonly _millisec: number;
  private _timerId: TimerId | undefined = undefined;

  constructor(millisec: number, startRightNow: boolean) {
    super({ type: 'Timer', currentValueInit: Option.none });
    this._millisec = millisec;
    if (startRightNow) {
      this.start();
    }
  }

  start(): this {
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
