import { ManagerOperatorRNClass, RN } from '../abstract_class';
import { Operator } from '../types';
import { isNone, monoParentTryUpdate, none, Option, some } from '../util';

export const throttleTime = <A>(millisec: number): Operator<A, A> => (
  parent: RN<A>
) => new ThrottleTimeRNClass(parent, millisec);

class ThrottleTimeRNClass<A> extends ManagerOperatorRNClass<A, A>
  implements RN<A> {
  private timerId: NodeJS.Timeout | undefined;
  private millisec: number;
  private isSkippingInput: boolean;
  private nextValueCandidate: Option<A>;

  constructor(parent: RN<A>, millisec: number) {
    super('async child', parent, none, false);
    this.millisec = millisec;
    this.isSkippingInput = false;
    this.nextValueCandidate = none;
  }

  protected update(nextValue: A): void {
    this.isUpdated = false;
    this.nextValueCandidate = some(nextValue);

    if (this.isSkippingInput) return;

    const curr = this.nextValueCandidate;
    if (isNone(curr)) return;

    this.isUpdated = true;
    super.update(curr.value);

    // set timer
    this.isSkippingInput = true;
    this.timerId = setTimeout(() => {
      this.isSkippingInput = false;
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
