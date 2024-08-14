import { isNonZeroInt, toNonZeroInt } from '@noshiro/ts-utils';
import { number } from '../../primitives/index.mjs';
import { type Type } from '../../type.mjs';
import { brand } from '../brand.mjs';

export const nonZeroInt = (
  defaultValue: NonZeroInt = toNonZeroInt(0),
): Type<NonZeroInt> =>
  brand({
    codec: number(defaultValue),
    is: isNonZeroInt,
    defaultValue,
    brandKeys: ['Finite', 'Int', '!=0'],
    brandFalseKeys: ['NaNValue'],
  } as const);
