import { isNonZeroInt } from 'ts-data-forge';
import { type NonZeroInt } from 'ts-type-forge';
import { brand } from '../../../brand/index.mjs';
import {
  number,
  type NumberRangeConstraints,
} from '../../../primitives/index.mjs';
import { type Type } from '../../../type.mjs';

export const nonZeroInt = (
  defaultValue: number,
  constraints?: NumberRangeConstraints,
): Type<NonZeroInt> =>
  brand({
    baseType: number(defaultValue, constraints ?? {}),
    is: isNonZeroInt,
    defaultValue,
    brandKeys: ['Finite', 'Int', '!=0'],
    brandFalseKeys: ['NaNValue'],
    typeName: 'NonZeroInt',
  });
