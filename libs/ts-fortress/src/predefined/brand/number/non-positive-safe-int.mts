import { isNonPositiveSafeInt } from 'ts-data-forge';
import { type NonPositiveSafeInt } from 'ts-type-forge';
import { brand } from '../../../brand/index.mjs';
import {
  number,
  type NumberRangeConstraints,
} from '../../../primitives/index.mjs';
import { type Type } from '../../../type.mjs';

export const nonPositiveSafeInt = (
  defaultValue: number = 0,
  constraints?: NumberRangeConstraints,
): Type<NonPositiveSafeInt> =>
  brand({
    baseType: number(defaultValue, constraints ?? {}),
    is: isNonPositiveSafeInt,
    defaultValue,
    brandKeys: [
      'Finite',
      'Int',
      'SafeInt',
      '< 2^15',
      '< 2^16',
      '< 2^31',
      '< 2^32',
      '<=0',
    ],
    brandFalseKeys: ['NaNValue'],
    typeName: 'NonPositiveSafeInt',
  });
