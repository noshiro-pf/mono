import { isNegativeFiniteNumber } from 'ts-data-forge';
import { type NegativeFiniteNumber } from 'ts-type-forge';
import { brand } from '../../../brand/index.mjs';
import {
  number,
  type NumberRangeConstraints,
} from '../../../primitives/index.mjs';
import { type Type } from '../../../type.mjs';

export const negativeFiniteNumber = (
  defaultValue: number,
  constraints?: NumberRangeConstraints,
): Type<NegativeFiniteNumber> =>
  brand({
    baseType: number(defaultValue, constraints ?? {}),
    is: isNegativeFiniteNumber,
    defaultValue,
    brandKeys: ['Finite', '!=0', '< 2^15', '< 2^16', '< 2^31', '< 2^32', '<=0'],
    brandFalseKeys: ['NaNValue', '>=0'],
    typeName: 'NegativeFiniteNumber',
  });
