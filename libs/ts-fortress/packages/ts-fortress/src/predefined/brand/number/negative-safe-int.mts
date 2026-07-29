import { isNegativeSafeInt } from 'ts-data-forge';
import { type NegativeSafeInt } from 'ts-type-forge';
import { brand } from '../../../brand/index.mjs';
import {
  number,
  type NumberRangeConstraints,
} from '../../../primitives/index.mjs';
import { type Type } from '../../../type.mjs';

export const negativeSafeInt = (
  defaultValue: number = -1,
  constraints?: NumberRangeConstraints,
): Type<NegativeSafeInt> =>
  brand({
    baseType: number(defaultValue, constraints ?? {}),
    is: isNegativeSafeInt,
    defaultValue,
    brandKeys: [
      'Finite',
      'Int',
      'SafeInt',
      '!=0',
      '< 2^15',
      '< 2^16',
      '< 2^31',
      '< 2^32',
      '<=0',
    ],
    brandFalseKeys: ['NaNValue', '>=0'],
    typeName: 'NegativeSafeInt',
  });
