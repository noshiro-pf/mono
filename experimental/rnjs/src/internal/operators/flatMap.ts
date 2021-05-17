import { RN } from '../mod';
import { Operator } from '../types/Operator';
import { Subscription } from '../types/Subscription';

export const flatMap =
  <T, U>(
    fn: (srcValue: T, srcIndex: number, index: number) => RN<U>,
    name: string = ''
  ): Operator<T, U> =>
  (src: RN<T>) =>
    new FlatMapRN<T, U>(src, fn, name);

class FlatMapRN<T, U> extends RN<U> {
  private latestRN: RN<U>;
  private subscriptions: Subscription[];
  private readonly fn: (srcValue: T, srcIndex: number, index: number) => RN<U>;

  constructor(
    src: RN<T>,
    fn: (srcValue: T, srcIndex: number, index: number) => RN<U>,
    name: string
  ) {
    super(fn(src.value, src.index, -1).value, [src], name);
    this.latestRN = fn(src.value, src.index, -1);
    this.fn = fn;
    this.subscriptions = [];
    this.subscriptions.push(
      this.latestRN.listen(true, (e) => this.fireWith(e))
    );
  }

  protected fire(): void {
    // switch latestRN here
    const src = this.parents[0] as RN<any>;
    // note: 'this.index' is not updated yet (will be updated in this.fireWith())
    this.latestRN = this.fn(src.value, src.index, this.index + 1);
    this.subscriptions.push(
      this.latestRN.listen(true, (e) => this.fireWith(e))
    );
  }

  protected complete(): void {
    super.complete();
    this.subscriptions.forEach((s) => s.unsubscribe());
  }
}
