import { isNonZeroSafeInt } from 'ts-data-forge';
import { number } from '../../primitives/index.mjs';
import { type Type } from '../../type.mjs';
import { brand } from '../brand.mjs';

export const nonZeroSafeInt = (
  defaultValue: NonZeroSafeInt,
): Type<NonZeroSafeInt> =>
  brand({
    codec: number(defaultValue),
    is: isNonZeroSafeInt,
    defaultValue,
    brandKeys: ['Finite', 'Int', 'SafeInt', '!=0'],
    brandFalseKeys: ['NaNValue'],
  });
