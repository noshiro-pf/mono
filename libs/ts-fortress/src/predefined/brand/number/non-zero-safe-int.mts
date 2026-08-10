import { isNonZeroSafeInt } from 'ts-data-forge';
import { type NonZeroSafeInt } from 'ts-type-forge';
import { brand } from '../../../brand/index.mjs';
import {
  number,
  type NumberRangeConstraints,
} from '../../../primitives/index.mjs';
import { type Type } from '../../../type.mjs';

export const nonZeroSafeInt = (
  defaultValue: number,
  constraints?: NumberRangeConstraints,
): Type<NonZeroSafeInt> =>
  brand({
    baseType: number(defaultValue, constraints ?? {}),
    is: isNonZeroSafeInt,
    defaultValue,
    brandKeys: ['Finite', 'Int', 'SafeInt', '!=0'],
    brandFalseKeys: ['NaNValue'],
    typeName: 'NonZeroSafeInt',
  });
