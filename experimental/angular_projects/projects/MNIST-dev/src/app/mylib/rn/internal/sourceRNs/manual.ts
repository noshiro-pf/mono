import { RN } from '../RN';

export const manual = <T>(initialValue: T) => new ManualRN<T>(initialValue);

class ManualRN<T> extends RN<T> {
  constructor(initialValue: T) {
    super(initialValue, []);
  }

  emit(val: T) {
    this.fireWith(val);
  }
}
