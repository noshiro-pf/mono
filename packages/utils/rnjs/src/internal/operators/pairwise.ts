import { RN } from '../mod';
import { Operator } from '../types/Operator';

export const pairwise = <T>(
  initialPrevValue?: T,
  name: string = ''
): Operator<T, [T, T]> => (src: RN<T>) =>
  new PairwiseRN<T>(src, initialPrevValue, name);

class PairwiseRN<T> extends RN<[T, T]> {
  private prevVal: T;

  constructor(src: RN<T>, initialPrevValue?: T, name: string = '') {
    super([initialPrevValue ?? src.value, src.value], [src], name);
    this.prevVal = initialPrevValue ?? src.value;
  }

  protected fire(): void {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const nextVal = (this.parents[0] as RN<any>).value;
    this.fireWith([this.prevVal, nextVal]);
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    this.prevVal = nextVal;
  }
}
