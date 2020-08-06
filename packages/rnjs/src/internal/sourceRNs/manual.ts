import { RN } from '../RN';

export const manual = <T>(initialValue: T, name: string = ''): ManualRN<T> =>
  new ManualRN<T>(initialValue, name);

export class ManualRN<T> extends RN<T> {
  constructor(initialValue: T, name: string = '') {
    super(initialValue, [], name);
  }

  emit(val: T): void {
    this.fireWith(val);
  }
}
