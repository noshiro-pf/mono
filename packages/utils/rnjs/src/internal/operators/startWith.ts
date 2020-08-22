import { RN } from '../mod';
import { Operator } from '../types/Operator';

export const startWith = <T>(
  initialValue: T,
  name: string = ''
): Operator<T, T> => (src: RN<T>) =>
  new StartWithRN<T>(src, initialValue, name);

class StartWithRN<T> extends RN<T> {
  constructor(src: RN<T>, initialValue: T, name: string = '') {
    super(initialValue, [src], name);
    this.fireWith(initialValue);
  }

  protected fire(): void {
    const src = this.parents[0];
    // note: 'this.index' is not updated yet (will be updated in this.fireWith())
    this.fireWith(src.value);
  }
}
