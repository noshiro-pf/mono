import { asNonZeroInt, isNonZeroInt } from 'ts-data-forge';
import { brand } from '../../../brand/index.mjs';
import { number } from '../../../primitives/index.mjs';
import { type Type } from '../../../type.mjs';

export const nonZeroInt = (
  defaultValue: NonZeroInt = asNonZeroInt(0),
): Type<NonZeroInt> =>
  brand({
    baseType: number(defaultValue),
    is: isNonZeroInt,
    defaultValue,
    brandKeys: ['Finite', 'Int', '!=0'],
    brandFalseKeys: ['NaNValue'],
    typeName: 'NonZeroInt',
  });
