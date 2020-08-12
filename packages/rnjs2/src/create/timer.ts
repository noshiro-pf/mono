import { ManagerRNClass, RN } from '../abstract_class';
import { none } from '../util';
import { TimerId } from '../types';

export const timer = (millisec: number): TimerRN => new TimerRNClass(millisec);

export interface TimerRN extends RN<number> {
  start(): void;
  stop(): void;
}

class TimerRNClass extends ManagerRNClass<number> implements TimerRN {
  private millisec: number;
  private timerId: TimerId | undefined;

  constructor(millisec: number) {
    super('source', 0, [], none, false);
    this.millisec = millisec;
  }

  start(): void {
    if (this.isCompleted) return;
    this.isUpdated = true;
    this.update(0);
    this.timerId = setTimeout(() => {
      this.update(0);
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
