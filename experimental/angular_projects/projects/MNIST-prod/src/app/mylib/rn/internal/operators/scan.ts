import { RN } from '../mod';
import { Operator } from '../types/Operator';

export const scan =
  <T, U>(
    initialValue: U,
    fn: (prev: U, curr: T, index?: number) => U,
  ): Operator<T, U> =>
  (src: RN<T>) =>
    new ScanRN<T, U>(initialValue, src, fn);

class ScanRN<T, U> extends RN<U> {
  private scanState: U;
  private fn: (prev: U, curr: T, index?: number) => U;

  constructor(
    initialValue: U,
    src: RN<T>,
    fn: (prev: U, curr: T, index?: number) => U,
  ) {
    super(initialValue, [src]);
    this.scanState = initialValue;
    this.fn = fn;
  }

  protected fire() {
    this.fireWith(this.fn(this.scanState, this.parents[0].value, this.index));
  }
}
