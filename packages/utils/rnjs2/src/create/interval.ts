import { ManagerRNClass, RN } from '../abstract_class';
import { TimerId } from '../types';
import { none } from '../util';

export const interval = (millisec: number): IntervalRN =>
  new IntervalRNClass(millisec);

export interface IntervalRN extends RN<number> {
  start(): void;
  stop(): void;
}

class IntervalRNClass extends ManagerRNClass<number> implements IntervalRN {
  private millisec: number;
  private timerId: TimerId | undefined;
  private counter: number = 0;

  constructor(millisec: number) {
    super('source', 0, [], none, false);
    this.millisec = millisec;
  }

  start(): void {
    if (this.isCompleted) return;
    this.isUpdated = true;
    this.update(0);
    this.timerId = setInterval(() => {
      this.counter += 1;
      this.update(this.counter);
    }, this.millisec);
  }

  stop(): void {
    this.complete();
  }

  tryUpdate(): void {
    // Manual updates are not allowed.
    return;
  }

  protected complete(): void {
    if (this.timerId !== undefined) {
      clearInterval(this.timerId);
    }
  }
}
