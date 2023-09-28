import { isUint32 } from '@noshiro/ts-utils';
import { number } from '../../primitives';
import { type Type } from '../../type';
import { brand } from '../brand';

// eslint-disable-next-line no-restricted-syntax
const is = isUint32 as (u: number) => u is Uint32;

export const uint32 = (defaultValue: number = 0): Type<Uint32> => {
  if (!is(defaultValue)) {
    throw new Error(
      'defaultValue must be a non-negative integer in the range of 32-bit unsigned'
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
      '> -2^16',
      '> -2^32',
      '>= -2^15',
      '>= -2^31',
      '>=0',
      '< 2^32',
    ],
    brandFalseKeys: ['NaN'],
  } as const);
};
