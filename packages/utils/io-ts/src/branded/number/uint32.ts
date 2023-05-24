import { isUint32 } from '@noshiro/ts-utils';
import { number } from '../../primitives';
import { type Type } from '../../type';
import { brand } from '../brand';

const is = isUint32 as (u: number) => u is Uint32Brand;

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
    brandKeys: ['Finite', 'Int', 'NonNegative', 'SafeInt', 'Uint32'],
    brandFalseKeys: ['NaN'],
  } as const);
};
