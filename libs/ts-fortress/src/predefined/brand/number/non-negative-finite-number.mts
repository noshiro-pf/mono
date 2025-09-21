import { isNonNegativeFiniteNumber } from 'ts-data-forge';
import { brand } from '../../../brand/index.mjs';
import { number } from '../../../primitives/index.mjs';
import { type Type } from '../../../type.mjs';

export const nonNegativeFiniteNumber = (
  defaultValue: number = 0,
): Type<NonNegativeFiniteNumber> =>
  brand({
    baseType: number(defaultValue),
    is: isNonNegativeFiniteNumber,
    defaultValue,
    brandKeys: ['>=0', '> -2^16', '> -2^32', '>= -2^15', '>= -2^31', 'Finite'],
    brandFalseKeys: ['NaNValue'],
    typeName: 'NonNegativeFiniteNumber',
  });
