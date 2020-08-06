import { ManagerOperatorRNClass, RN } from '../abstract_class';
import { Operator } from '../types';
import { isNotNone, monoParentTryUpdate, none, Option, some } from '../util';

export const auditTime = <A>(millisec: number): Operator<A, A> => (
  parent: RN<A>
) => new AuditTimeRNClass(parent, millisec);

class AuditTimeRNClass<A> extends ManagerOperatorRNClass<A, A>
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

    // set timer
    this.isSkippingInput = true;
    this.timerId = setTimeout(() => {
      const curr = this.nextValueCandidate;
      if (isNotNone(curr)) {
        this.isUpdated = true;
        super.update(curr.value);
        this.isSkippingInput = false;
      }
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
