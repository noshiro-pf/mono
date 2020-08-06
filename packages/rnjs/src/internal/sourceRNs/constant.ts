import { RN } from '../RN';

export const constant = <T>(value: T, name: string = ''): ConstantRN<T> =>
  new ConstantRN<T>(value, name);

export const of = <T>(value: T, name: string = ''): ConstantRN<T> =>
  new ConstantRN<T>(value, name);

class ConstantRN<T> extends RN<T> {
  constructor(value: T, name: string = '') {
    super(value, [], name);
  }
}
