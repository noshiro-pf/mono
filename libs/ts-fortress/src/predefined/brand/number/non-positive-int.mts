import { isNonPositiveInt } from 'ts-data-forge';
import { type NonPositiveInt } from 'ts-type-forge';
import { brand } from '../../../brand/index.mjs';
import {
  number,
  type NumberRangeConstraints,
} from '../../../primitives/index.mjs';
import { type Type } from '../../../type.mjs';

export const nonPositiveInt = (
  defaultValue: number = 0,
  constraints?: NumberRangeConstraints,
): Type<NonPositiveInt> =>
  brand({
    baseType: number(defaultValue, constraints ?? {}),
    is: isNonPositiveInt,
    defaultValue,
    brandKeys: ['Finite', 'Int', '< 2^15', '< 2^16', '< 2^31', '< 2^32', '<=0'],
    brandFalseKeys: ['NaNValue'],
    typeName: 'NonPositiveInt',
  });
