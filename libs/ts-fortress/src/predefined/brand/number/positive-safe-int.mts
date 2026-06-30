import { isPositiveSafeInt } from 'ts-data-forge';
import { type PositiveSafeInt } from 'ts-type-forge';
import { brand } from '../../../brand/index.mjs';
import {
  number,
  type NumberRangeConstraints,
} from '../../../primitives/index.mjs';
import { type Type } from '../../../type.mjs';

export const positiveSafeInt = (
  defaultValue: number = 1,
  constraints?: NumberRangeConstraints,
): Type<PositiveSafeInt> =>
  brand({
    baseType: number(defaultValue, constraints ?? {}),
    is: isPositiveSafeInt,
    defaultValue,
    brandKeys: [
      'Finite',
      'Int',
      'SafeInt',
      '> -2^32',
      '>= -2^31',
      '> -2^16',
      '>= -2^15',
      '>=0',
      '!=0',
    ],
    brandFalseKeys: ['NaNValue', '<=0'],
    typeName: 'PositiveSafeInt',
  });
