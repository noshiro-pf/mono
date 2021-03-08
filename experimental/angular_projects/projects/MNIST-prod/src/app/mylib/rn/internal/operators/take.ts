import { RN } from '../mod';
import { Operator } from '../types/Operator';

export const take = <T>(takeNum: number): Operator<T, T> => (src: RN<T>) =>
  new TakeWhileRN<T>(src, (_, index) => index < takeNum);

export const takeWhile = <T>(
  predicate: (value: T, index: number) => boolean
): Operator<T, T> => (src: RN<T>) => new TakeWhileRN<T>(src, predicate);

class TakeWhileRN<T> extends RN<T> {
  private predicate: (value: T, index: number) => boolean;

  constructor(src: RN<T>, predicate: (value: T, index: number) => boolean) {
    super(src.value, [src]);
    this.predicate = predicate;
  }

  protected fire() {
    const next = this.parents[0];

    if (this.predicate(next.value, next.index)) {
      this.fireWith(next.value);
    } else {
      this.complete();
    }
  }
}
