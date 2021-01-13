import { ManagerObservableClass, Observable } from '../abstract_class';
import { TimerId } from '../types';
import { none } from '../util';

export const timer = (millisec: number): TimerObservable =>
  new TimerObservableClass(millisec);

export interface TimerObservable extends Observable<number> {
  start(): void;
  stop(): void;
}

class TimerObservableClass
  extends ManagerObservableClass<number>
  implements TimerObservable {
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
