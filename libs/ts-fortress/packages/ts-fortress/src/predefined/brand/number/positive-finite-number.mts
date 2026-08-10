import { isPositiveFiniteNumber } from 'ts-data-forge';
import { type PositiveFiniteNumber } from 'ts-type-forge';
import { brand } from '../../../brand/index.mjs';
import {
  number,
  type NumberRangeConstraints,
} from '../../../primitives/index.mjs';
import { type Type } from '../../../type.mjs';

export const positiveFiniteNumber = (
  defaultValue: number,
  constraints?: NumberRangeConstraints,
): Type<PositiveFiniteNumber> =>
  brand({
    baseType: number(defaultValue, constraints ?? {}),
    is: isPositiveFiniteNumber,
    defaultValue,
    brandKeys: [
      '>=0',
      '> -2^16',
      '> -2^32',
      '>= -2^15',
      '>= -2^31',
      'Finite',
      '!=0',
    ],
    brandFalseKeys: ['NaNValue', '<=0'],
    typeName: 'PositiveFiniteNumber',
  });
