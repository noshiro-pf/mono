import { RN } from '../mod';
import { Operator } from '../types/Operator';

export const withLatest =
  <T, U>(src2: RN<U>, name: string = ''): Operator<T, [T, U]> =>
  (src: RN<T>) =>
    new WithLatestRN<T, U>(src, src2, name);

class WithLatestRN<T, U> extends RN<[T, U]> {
  private readonly src2: RN<U>;

  constructor(src: RN<T>, src2: RN<U>, name: string = '') {
    super([src.value, src2.value], [src], name);
    this.src2 = src2;
  }

  protected fire(): void {
    this.fireWith([(this.parents[0] as RN<any>).value, this.src2.value]);
  }
}
