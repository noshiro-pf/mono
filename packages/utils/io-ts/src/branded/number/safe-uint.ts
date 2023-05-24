import { Num } from '@noshiro/ts-utils';
import { number } from '../../primitives';
import { type Type } from '../../type';
import { brand } from '../brand';

const is = (a: number): a is SafeUintBrand =>
  Number.isSafeInteger(a) && Num.isNonNegative(a);

export const safeUint = (defaultValue: number = 0): Type<SafeUint> => {
  if (!is(defaultValue)) {
    throw new Error('defaultValue must be an integer');
  }

  return brand({
    codec: number(defaultValue),
    is,
    defaultValue,
    brandKeys: ['Finite', 'Int', 'SafeInt', 'NonNegative'],
    brandFalseKeys: ['NaN'],
  } as const);
};
