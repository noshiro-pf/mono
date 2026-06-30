import { isNonNegativeFiniteNumber } from 'ts-data-forge';
import { type NonNegativeFiniteNumber } from 'ts-type-forge';
import { brand } from '../../../brand/index.mjs';
import {
  number,
  type NumberRangeConstraints,
} from '../../../primitives/index.mjs';
import { type Type } from '../../../type.mjs';

export const nonNegativeFiniteNumber = (
  defaultValue: number = 0,
  constraints?: NumberRangeConstraints,
): Type<NonNegativeFiniteNumber> =>
  brand({
    baseType: number(defaultValue, constraints ?? {}),
    is: isNonNegativeFiniteNumber,
    defaultValue,
    brandKeys: ['>=0', '> -2^16', '> -2^32', '>= -2^15', '>= -2^31', 'Finite'],
    brandFalseKeys: ['NaNValue'],
    typeName: 'NonNegativeFiniteNumber',
  });
