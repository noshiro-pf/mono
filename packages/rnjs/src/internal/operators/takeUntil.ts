import { RN } from '../mod';
import { Operator } from '../types/Operator';
import { Subscription } from '../types/Subscription';
import { noop } from '../utils';

export const terminateBy = <T>(
  terminator: RN<void>,
  name: string
): Operator<T, T> => (src: RN<T>) => new TakeUntilRN<T>(src, terminator, name);

export const takeUntil = <T>(
  terminator: RN<void>,
  name: string
): Operator<T, T> => (src: RN<T>) => new TakeUntilRN<T>(src, terminator, name);

class TakeUntilRN<T> extends RN<T> {
  private readonly subscription: Subscription;

  constructor(src: RN<T>, terminator: RN<void>, name: string) {
    super(src.value, [src], name);
    const terminate = (): void => {
      this.complete();
    };
    this.subscription = terminator.listen(false, terminate, noop, terminate);
  }

  protected fire(): void {
    const src = this.parents[0];
    this.fireWith(src.value);
  }

  protected complete(): void {
    super.complete();
    this.subscription.unsubscribe();
  }
}
