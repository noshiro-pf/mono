import { Num } from '@noshiro/ts-utils';
import { number } from '../../primitives/index.mjs';
import { type Type } from '../../type.mjs';
import { brand } from '../brand.mjs';

const is = Num.isNonNegative;

export const nonNegativeNumber = (
  defaultValue: number = 0,
): Type<NonNegativeNumber> => {
  if (!is(defaultValue)) {
    throw new Error('defaultValue must be a non-negative number');
  }

  return brand({
    codec: number(defaultValue),
    is,
    defaultValue,
    brandKeys: ['>=0', '> -2^16', '> -2^32', '>= -2^15', '>= -2^31'],
    brandFalseKeys: ['NaNValue'],
  } as const);
};
