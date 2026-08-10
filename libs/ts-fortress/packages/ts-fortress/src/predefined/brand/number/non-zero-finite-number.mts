import { isNonZeroFiniteNumber } from 'ts-data-forge';
import { type NonZeroFiniteNumber } from 'ts-type-forge';
import { brand } from '../../../brand/index.mjs';
import {
  number,
  type NumberRangeConstraints,
} from '../../../primitives/index.mjs';
import { type Type } from '../../../type.mjs';

export const nonZeroFiniteNumber = (
  defaultValue: number,
  constraints?: NumberRangeConstraints,
): Type<NonZeroFiniteNumber> =>
  brand({
    baseType: number(defaultValue, constraints ?? {}),
    is: isNonZeroFiniteNumber,
    defaultValue,
    brandKeys: ['!=0', 'Finite'],
    brandFalseKeys: ['NaNValue'],
    typeName: 'NonZeroFiniteNumber',
  });
