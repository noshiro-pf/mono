import { RN } from '../RN';

export const timer = (
  milliSec: number,
  startImmediately: boolean = false,
  name: string = '',
): TimerRN => new TimerRN(milliSec, startImmediately, name);

class TimerRN extends RN<number> {
  private timerId: any;
  private milliSec: number;
  private started: boolean = false;

  constructor(
    milliSec: number,
    startImmediately: boolean = false,
    name: string = '',
  ) {
    super(0, [], name);
    this.milliSec = milliSec;
    if (startImmediately) this.start();
  }

  start(): void {
    if (this.started) return;
    this.started = true;

    this.timerId = setTimeout(() => {
      this.fireWith(0);
    }, this.milliSec);
  }

  stop(): void {
    this.complete();
  } // alias

  protected complete(): void {
    super.complete();
    clearTimeout(this.timerId);
  }
}
