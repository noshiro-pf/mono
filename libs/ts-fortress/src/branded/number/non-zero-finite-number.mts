import { isNonZeroFiniteNumber } from 'ts-data-forge';
import { number } from '../../primitives/index.mjs';
import { type Type } from '../../type.mjs';
import { brand } from '../brand.mjs';

export const nonZeroFiniteNumber = (
  defaultValue: NonZeroFiniteNumber,
): Type<NonZeroFiniteNumber> =>
  brand({
    baseType: number(defaultValue),
    is: isNonZeroFiniteNumber,
    defaultValue,
    brandKeys: ['!=0', 'Finite'],
    brandFalseKeys: ['NaNValue'],
    typeName: 'NonZeroFiniteNumber',
  });
