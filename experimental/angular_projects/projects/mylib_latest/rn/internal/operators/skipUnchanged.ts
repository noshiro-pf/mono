import { RN } from '../mod';
import { Operator } from '../types/Operator';

export const skipUnchanged = <T>(
  eq: (a: T, b: T) => boolean = (a, b) => a === b
): Operator<T, T> => (src: RN<T>) => new SkipUnchangedRN<T>(src, eq);

class SkipUnchangedRN<T> extends RN<T> {
  private eq: (a: T, b: T) => boolean = (a, b) => a === b;

  constructor(src: RN<T>, eq: (a: T, b: T) => boolean = (a, b) => a === b) {
    super(src.value, [src]);
    this.eq = eq;
  }

  protected fire() {
    const nextVal = this.parents[0].value;
    const currVal = this.value;

    if (!this.eq(nextVal, currVal)) {
      this.fireWith(nextVal);
    }
  }
}
