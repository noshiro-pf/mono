import { RN } from '../mod';
import { Operator } from '../types/Operator';

export const withInitialValue = <T>(
  initialValue: T,
  name: string = ''
): Operator<T, T> => (src: RN<T>) =>
  new WithInitialValueRN<T>(src, initialValue, name);

class WithInitialValueRN<T> extends RN<T> {
  constructor(src: RN<T>, initialValue: T, name: string = '') {
    super(initialValue, [src], name);
  }

  protected fire(): void {
    const src = this.parents[0];
    // note: 'this.index' is not updated yet (will be updated in this.fireWith())
    this.fireWith(src.value);
  }
}
