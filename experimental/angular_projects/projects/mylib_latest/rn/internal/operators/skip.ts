import { RN } from '../mod';
import { Operator } from '../types/Operator';

export const skip =
  <T>(initialValue: T, skipNum: number): Operator<T, T> =>
  (src: RN<T>) =>
    new SkipWhileRN<T>(src, initialValue, (_, index) => index < skipNum);

export const skipWhile =
  <T>(
    initialValue: T,
    predicate: (value: T, index: number) => boolean,
  ): Operator<T, T> =>
  (src: RN<T>) =>
    new SkipWhileRN<T>(src, initialValue, predicate);

class SkipWhileRN<T> extends RN<T> {
  private predicate: (value: T, index: number) => boolean;

  constructor(
    src: RN<T>,
    initialValue: T,
    predicate: (value: T, index: number) => boolean,
  ) {
    super(initialValue, [src]);
    this.predicate = predicate;
  }

  protected fire() {
    const nextValue = this.parents[0].value;
    const nextIndex = this.parents[0].index;
    if (!this.predicate(nextValue, nextIndex)) {
      this.fireWith(nextValue);
    }
  }
}
