import { asFiniteNumber, FiniteNumber } from 'ts-data-forge';
import { brand } from '../../../brand/index.mjs';
import { number } from '../../../primitives/index.mjs';
import { type Type } from '../../../type.mjs';

export const finiteNumber = (
  defaultValue: FiniteNumber = asFiniteNumber(0),
): Type<FiniteNumber> =>
  brand({
    baseType: number(defaultValue),
    is: FiniteNumber.is,
    defaultValue,
    brandKeys: ['Finite'],
    brandFalseKeys: ['NaNValue'],
    typeName: 'FiniteNumber',
  });
