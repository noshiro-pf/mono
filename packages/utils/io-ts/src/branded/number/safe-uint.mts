import { Num } from '@noshiro/ts-utils';
import { number } from '../../primitives/index.mjs';
import { type Type } from '../../type.mjs';
import { brand } from '../brand.mjs';

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
    brandFalseKeys: ['NaNValue'],
  } as const);
};
