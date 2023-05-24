import { Num } from '@noshiro/ts-utils';
import { number } from '../../primitives';
import { type Type } from '../../type';
import { brand } from '../brand';

const is = (a: number): a is UintBrand =>
  !Number.isNaN(a) && Number.isInteger(a) && Num.isNonNegative(a);

export const uint = (defaultValue: number = 0): Type<Uint> => {
  if (!is(defaultValue)) {
    throw new Error('defaultValue must be a non-negative integer');
  }

  return brand({
    codec: number(defaultValue),
    is,
    defaultValue,
    brandKeys: ['Finite', 'NonNegative', 'Int'],
    brandFalseKeys: ['NaN'],
  } as const);
};
