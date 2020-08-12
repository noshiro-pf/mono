import { RN } from '../mod';
import { Operator } from '../types/Operator';

export const scan = <T, U>(
  initialValue: U,
  fn: (state: Readonly<U>, srcValue: T, srcIndex?: number, index?: number) => U,
  name: string = ''
): Operator<T, U> => (src: RN<T>) =>
  new ScanRN<T, U>(src, initialValue, fn, name);

class ScanRN<T, U> extends RN<U> {
  private scanState: U;
  private readonly fn: (
    state: Readonly<U>,
    srcValue: T,
    srcIndex?: number,
    index?: number
  ) => U;

  constructor(
    src: RN<T>,
    initialValue: U,
    fn: (
      state: Readonly<U>,
      srcValue: T,
      srcIndex?: number,
      index?: number
    ) => U,
    name: string
  ) {
    super(initialValue, [src], name);
    this.scanState = initialValue;
    this.fn = fn;
  }

  protected fire(): void {
    const src = this.parents[0];
    // note: 'this.index' is not updated yet (will be updated in this.fireWith())
    this.scanState = this.fn(
      this.scanState,
      src.value,
      src.index,
      this.index + 1
    );
    this.fireWith(this.scanState);
  }
}
