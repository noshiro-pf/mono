import { RN } from '../mod';
import { Operator } from '../types/Operator';

export const withDefault = <T>(
  defaultValue: T,
  name: string = ''
): Operator<T, T> => (src: RN<T>) =>
  new WithDefaultValueRN<T>(src, defaultValue, name);

class WithDefaultValueRN<T> extends RN<T> {
  private readonly defaultValue: T;

  constructor(src: RN<T>, defaultValue: T, name: string = '') {
    super(src.value, [src], name);
    this.defaultValue = defaultValue;
  }

  protected fire(): void {
    const src = this.parents[0] as RN<any>;
    // note: 'this.index' is not updated yet (will be updated in this.fireWith())
    this.fireWith(src.value ?? this.defaultValue);
  }
}
