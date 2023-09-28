import { Num } from '@noshiro/ts-utils';
import { number } from '../../primitives';
import { type Type } from '../../type';
import { brand } from '../brand';

const is = (a: number): a is Uint =>
  !Number.isNaN(a) && Number.isInteger(a) && Num.isNonNegative(a);

export const uint = (defaultValue: number = 0): Type<Uint> => {
  if (!is(defaultValue)) {
    throw new Error('defaultValue must be a non-negative integer');
  }

  return brand({
    codec: number(defaultValue),
    is,
    defaultValue,
    brandKeys: [
      'Finite',
      'Int',
      '> -2^32',
      '>= -2^31',
      '> -2^16',
      '>= -2^15',
      '>=0',
    ],
    brandFalseKeys: ['NaN'],
  } as const);
};
