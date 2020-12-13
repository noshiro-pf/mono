import { ManagerOperatorRNClass, RN } from '../abstract_class';
import { Operator, TimerId } from '../types';
import { monoParentTryUpdate, none } from '../util';

export const debounceTime = <A>(millisec: number): Operator<A, A> => (
  parent: RN<A>
) => new DebounceTimeRNClass(parent, millisec);

class DebounceTimeRNClass<A>
  extends ManagerOperatorRNClass<A, A>
  implements RN<A> {
  private timerId: TimerId | undefined;
  private millisec: number;

  constructor(parent: RN<A>, millisec: number) {
    super('async child', parent, none, false);
    this.millisec = millisec;
  }

  protected update(nextValue: A): void {
    // reset timer
    if (this.timerId !== undefined) {
      clearTimeout(this.timerId);
    }
    // set timer
    this.timerId = setTimeout(() => {
      this.isUpdated = true;
      super.update(nextValue);
    }, this.millisec);
  }

  tryUpdate(): void {
    this.tryUpdateAndSetFlag(() => {
      const b = monoParentTryUpdate(this.parent);
      if (b === 'skipped') return false;
      this.update(b.value);
      return false;
    });
  }

  protected complete(): void {
    if (this.timerId !== undefined) {
      clearInterval(this.timerId);
    }
  }
}
