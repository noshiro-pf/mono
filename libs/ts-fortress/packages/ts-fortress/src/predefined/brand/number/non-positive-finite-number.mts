import { isNonPositiveFiniteNumber } from 'ts-data-forge';
import { type NonPositiveFiniteNumber } from 'ts-type-forge';
import { brand } from '../../../brand/index.mjs';
import {
  number,
  type NumberRangeConstraints,
} from '../../../primitives/index.mjs';
import { type Type } from '../../../type.mjs';

export const nonPositiveFiniteNumber = (
  defaultValue: number = 0,
  constraints?: NumberRangeConstraints,
): Type<NonPositiveFiniteNumber> =>
  brand({
    baseType: number(defaultValue, constraints ?? {}),
    is: isNonPositiveFiniteNumber,
    defaultValue,
    brandKeys: ['Finite', '< 2^15', '< 2^16', '< 2^31', '< 2^32', '<=0'],
    brandFalseKeys: ['NaNValue'],
    typeName: 'NonPositiveFiniteNumber',
  });
