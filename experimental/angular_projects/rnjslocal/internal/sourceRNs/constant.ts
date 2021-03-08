import { RN } from '../RN';

export const constant = <T>(value: T) => new ConstantRN<T>(value);

export const of = <T>(value: T) => new ConstantRN<T>(value);

class ConstantRN<T> extends RN<T> {
  constructor(value: T) {
    super(value, []);
  }
}
