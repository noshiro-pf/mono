import { isPositiveSafeInt, toPositiveSafeInt } from '@noshiro/ts-utils';
import { number } from '../../primitives/index.mjs';
import { type Type } from '../../type.mjs';
import { brand } from '../brand.mjs';

export const positiveSafeInt = (
  defaultValue: PositiveSafeInt = toPositiveSafeInt(1),
): Type<PositiveSafeInt> =>
  brand({
    codec: number(defaultValue),
    is: isPositiveSafeInt,
    defaultValue,
    brandKeys: [
      'Finite',
      'Int',
      'SafeInt',
      '> -2^32',
      '>= -2^31',
      '> -2^16',
      '>= -2^15',
      '>=0',
      '!=0',
    ],
    brandFalseKeys: ['NaNValue'],
  });
