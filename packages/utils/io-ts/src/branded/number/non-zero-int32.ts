import { Num } from '@noshiro/ts-utils';
import { number } from '../../primitives';
import { type Type } from '../../type';
import { brand } from '../brand';

const is = (a: number): a is NonZeroInt32 => Num.isInt32(a) && Num.isNonZero(a);

export const nonZeroInt32 = (defaultValue: number = 0): Type<NonZeroInt32> => {
  if (!is(defaultValue)) {
    throw new Error(
      'defaultValue must be a non-zero integer in the range of 32-bit signed'
    );
  }

  return brand({
    codec: number(defaultValue),
    is,
    defaultValue,
    brandKeys: ['Finite', 'NonZero', 'Int', 'SafeInt', 'Int32'],
  } as const);
};
