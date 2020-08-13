import { RN } from '../RN';

export const interval = (
  milliSec: number,
  startImmediately: boolean = false,
  name: string = ''
): IntervalRN => new IntervalRN(milliSec, startImmediately, name);

class IntervalRN extends RN<number> {
  private timerId: any;
  private counter: number;
  private milliSec: number;
  private started: boolean = false;

  constructor(
    milliSec: number,
    startImmediately: boolean = false,
    name: string = ''
  ) {
    super(0, [], name);
    this.milliSec = milliSec;
    this.counter = 0;
    if (startImmediately) this.start();
  }

  start(): void {
    if (this.started) return;
    this.started = true;

    this.fireWith(this.counter); // emit first
    this.timerId = setInterval(() => {
      this.counter += 1;
      this.fireWith(this.counter);
    }, this.milliSec);
  }

  stop(): void {
    this.complete();
  } // alias

  protected complete(): void {
    super.complete();
    clearInterval(this.timerId);
  }
}
