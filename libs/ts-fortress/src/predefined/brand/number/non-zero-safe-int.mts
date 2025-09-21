import { isNonZeroSafeInt } from 'ts-data-forge';
import { brand } from '../../../brand/index.mjs';
import { number } from '../../../primitives/index.mjs';
import { type Type } from '../../../type.mjs';

export const nonZeroSafeInt = (defaultValue: number): Type<NonZeroSafeInt> =>
  brand({
    baseType: number(defaultValue),
    is: isNonZeroSafeInt,
    defaultValue,
    brandKeys: ['Finite', 'Int', 'SafeInt', '!=0'],
    brandFalseKeys: ['NaNValue'],
    typeName: 'NonZeroSafeInt',
  });
