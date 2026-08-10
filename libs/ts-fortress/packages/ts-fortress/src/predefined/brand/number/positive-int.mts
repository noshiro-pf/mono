import { isPositiveInt } from 'ts-data-forge';
import { type PositiveInt } from 'ts-type-forge';
import { brand } from '../../../brand/index.mjs';
import {
  number,
  type NumberRangeConstraints,
} from '../../../primitives/index.mjs';
import { type Type } from '../../../type.mjs';

export const positiveInt = (
  defaultValue: number = 1,
  constraints?: NumberRangeConstraints,
): Type<PositiveInt> =>
  brand({
    baseType: number(defaultValue, constraints ?? {}),
    is: isPositiveInt,
    defaultValue,
    brandKeys: [
      'Finite',
      'Int',
      '> -2^32',
      '>= -2^31',
      '> -2^16',
      '>= -2^15',
      '>=0',
      '!=0',
    ],
    brandFalseKeys: ['NaNValue', '<=0'],
    typeName: 'PositiveInt',
  });
