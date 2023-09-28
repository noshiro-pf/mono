import { Num } from '@noshiro/ts-utils';
import { number } from '../../primitives';
import { type Type } from '../../type';
import { brand } from '../brand';

const is = (a: number): a is SafeUint =>
  Number.isSafeInteger(a) && Num.isNonNegative(a);

export const safeUint = (defaultValue: number = 0): Type<SafeUint> => {
  if (!is(defaultValue)) {
    throw new Error('defaultValue must be an integer');
  }

  return brand({
    codec: number(defaultValue),
    is,
    defaultValue,
    brandKeys: [
      'Finite',
      'Int',
      'SafeInt',
      '> -2^16',
      '> -2^32',
      '>= -2^15',
      '>= -2^31',
      '>=0',
    ],
    brandFalseKeys: ['NaN'],
  } as const);
};
