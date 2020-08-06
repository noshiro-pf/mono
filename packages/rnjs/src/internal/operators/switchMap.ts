import { RN } from '../mod';
import { Operator } from '../types/Operator';
import { Subscription } from '../types/Subscription';

export const switchMap = <T, U>(
  fn: (srcValue: T, srcIndex: number, index: number) => RN<U>,
  name: string = ''
): Operator<T, U> => (src: RN<T>) => new SwitchMapRN<T, U>(src, fn, name);

class SwitchMapRN<T, U> extends RN<U> {
  private latestRN: RN<U>;
  private subscription: Subscription;
  private readonly fn: (srcValue: T, srcIndex: number, index: number) => RN<U>;

  constructor(
    src: RN<T>,
    fn: (srcValue: T, srcIndex: number, index: number) => RN<U>,
    name: string
  ) {
    super(fn(src.value, src.index, -1).value, [src], name);
    this.latestRN = fn(src.value, src.index, -1);
    this.fn = fn;
    this.subscription = this.latestRN.listen(true, (e) => this.fireWith(e));
  }

  protected fire() {
    // switch latestRN here
    this.subscription.unsubscribe();
    const src = this.parents[0];
    // note: 'this.index' is not updated yet (will be updated in this.fireWith())
    this.latestRN = this.fn(src.value, src.index, this.index + 1);
    this.subscription = this.latestRN.listen(true, (e) => this.fireWith(e));
  }

  protected complete() {
    super.complete();
    this.subscription.unsubscribe();
  }
}
