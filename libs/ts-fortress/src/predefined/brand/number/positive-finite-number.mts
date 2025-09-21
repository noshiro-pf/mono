import { isPositiveFiniteNumber } from 'ts-data-forge';
import { brand } from '../../../brand/index.mjs';
import { number } from '../../../primitives/index.mjs';
import { type Type } from '../../../type.mjs';

export const positiveFiniteNumber = (
  defaultValue: number,
): Type<PositiveFiniteNumber> =>
  brand({
    baseType: number(defaultValue),
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
    brandFalseKeys: ['NaNValue'],
    typeName: 'PositiveFiniteNumber',
  });
