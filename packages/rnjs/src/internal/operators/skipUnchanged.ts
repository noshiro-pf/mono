import { RN } from '../mod';
import { Operator } from '../types/Operator';

export const skipUnchanged = <T>(
  eq: (a: T, b: T) => boolean = (a, b) => a === b,
  name: string = ''
): Operator<T, T> => (src: RN<T>) => new SkipUnchangedRN<T>(src, eq, name);

class SkipUnchangedRN<T> extends RN<T> {
  constructor(
    src: RN<T>,
    eq: (a: T, b: T) => boolean = (a, b) => a === b,
    name: string = ''
  ) {
    super(src.value, [src], name);
    this.eq = eq;
  }

  protected fire() {
    const currVal = this.parents[0].value;
    const prevVal = this.value;

    if (!this.eq(currVal, prevVal)) {
      this.fireWith(currVal);
    }
  }

  private readonly eq: (a: T, b: T) => boolean = (a, b) => a === b;
}
