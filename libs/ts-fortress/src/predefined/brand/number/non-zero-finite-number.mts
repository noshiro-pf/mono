import { isNonZeroFiniteNumber } from 'ts-data-forge';
import { brand } from '../../../brand/index.mjs';
import { number } from '../../../primitives/index.mjs';
import { type Type } from '../../../type.mjs';

export const nonZeroFiniteNumber = (
  defaultValue: number,
): Type<NonZeroFiniteNumber> =>
  brand({
    baseType: number(defaultValue),
    is: isNonZeroFiniteNumber,
    defaultValue,
    brandKeys: ['!=0', 'Finite'],
    brandFalseKeys: ['NaNValue'],
    typeName: 'NonZeroFiniteNumber',
  });
