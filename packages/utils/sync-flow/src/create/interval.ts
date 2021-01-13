import { ManagerObservableClass, Observable } from '../abstract_class';
import { TimerId } from '../types';
import { none } from '../util';

export const interval = (millisec: number): IntervalObservable =>
  new IntervalObservableClass(millisec);

export interface IntervalObservable extends Observable<number> {
  start(): void;
  stop(): void;
}

class IntervalObservableClass
  extends ManagerObservableClass<number>
  implements IntervalObservable {
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
