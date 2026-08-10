import { isNegativeInt } from 'ts-data-forge';
import { type NegativeInt } from 'ts-type-forge';
import { brand } from '../../../brand/index.mjs';
import {
  number,
  type NumberRangeConstraints,
} from '../../../primitives/index.mjs';
import { type Type } from '../../../type.mjs';

export const negativeInt = (
  defaultValue: number = -1,
  constraints?: NumberRangeConstraints,
): Type<NegativeInt> =>
  brand({
    baseType: number(defaultValue, constraints ?? {}),
    is: isNegativeInt,
    defaultValue,
    brandKeys: [
      'Finite',
      'Int',
      '!=0',
      '< 2^15',
      '< 2^16',
      '< 2^31',
      '< 2^32',
      '<=0',
    ],
    brandFalseKeys: ['NaNValue', '>=0'],
    typeName: 'NegativeInt',
  });
