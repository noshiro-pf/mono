import { isInt32 } from '@noshiro/ts-utils';
import { number } from '../../primitives';
import { type Type } from '../../type';
import { brand } from '../brand';

// eslint-disable-next-line no-restricted-syntax
const is = isInt32 as (u: number) => u is Int32;

export const int32 = (defaultValue: number = 0): Type<Int32> => {
  if (!is(defaultValue)) {
    throw new Error(
      'defaultValue must be a integer in the range of 32-bit signed',
    );
  }

  return brand({
    codec: number(defaultValue),
    is,
    defaultValue,
    brandKeys: [
      'Finite',
      'Int',
      'SafeInt',
      '> -2^32',
      '>= -2^31',
      '< 2^32',
      '< 2^31',
    ],
    brandFalseKeys: ['NaN'],
  } as const);
};
